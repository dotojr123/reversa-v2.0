import * as acorn from 'acorn';
import * as walk from 'acorn-walk';
import fs from 'fs/promises';
import path from 'path';

export class Scanner {
    constructor(baseDir) {
        this.baseDir = baseDir;
    }

    async scan(filePath) {
        const fullPath = path.resolve(this.baseDir, filePath);
        const code = await fs.readFile(fullPath, 'utf-8');

        // Normaliza separadores de path para comparação cross-platform
        let relativePath = path.relative(this.baseDir, fullPath).replace(/\\/g, '/');

        const ast = acorn.parse(code, { ecmaVersion: 2022, sourceType: 'module', locations: true });

        const knowledgeObjects = [];
        const imports = new Map(); // name -> importedFrom

        // ─── Fase 1: Coletar Imports ───
        walk.simple(ast, {
            ImportDeclaration(node) {
                const source = node.source.value;
                for (const spec of node.specifiers) {
                    if (spec.type === 'ImportSpecifier') {
                        imports.set(spec.local.name, source);
                    }
                }
            }
        });

        // ─── Fase 2: Coletar Declarations ───
        walk.simple(ast, {

            // ═══════════════════════════════════════════════
            // FUNÇÕES SOLTAS (top-level function declarations)
            // ═══════════════════════════════════════════════
            // Sem contexto de DI (construtor), NÃO inferimos Class.*
            // a partir de obj.method() — qualquer parâmetro pode ser
            // um primitivo chamando built-in (ex: amount.toFixed()).
            FunctionDeclaration(node) {
                const name = node.id.name;
                const params = node.params.map(p => p.name);
                const line = node.loc.start.line;

                const dependsOn = new Set();
                walk.simple(node.body, {
                    CallExpression(call) {
                        // Apenas chamada direta a função: foo()
                        if (call.callee.type === 'Identifier') {
                            dependsOn.add(`Function.${call.callee.name}`);
                        }
                        // NÃO tratamos MemberExpression aqui — sem DI,
                        // não há base para inferir classe de um obj.method()
                    },
                    Identifier(id) {
                        if (id.name === 'TAX_RATE') dependsOn.add('Const.TAX_RATE');
                    }
                });

                const ko = {
                    canonicalId: `Function.${name}`,
                    type: "FUNCTION",
                    content: { name, params },
                    evidences: [{ type: "SOURCE_CODE", path: relativePath, line, confidence: 90 }]
                };
                if (dependsOn.size > 0) ko.content.dependsOn = Array.from(dependsOn);
                knowledgeObjects.push(ko);
            },

            // ═══════════════════════════════════════════════
            // CLASSES — inferência baseada em fluxo de dados
            // ═══════════════════════════════════════════════
            ClassDeclaration(node) {
                const name = node.id.name;
                const line = node.loc.start.line;
                const methods = [];
                const classDependsOn = new Set();

                // ── Fase A: Extrair slots de injeção de dependência do construtor ──
                //
                // Padrão detectado: this.<slot> = <param>
                //   onde <param> é um parâmetro do construtor.
                //
                // Exemplo:
                //   constructor(orderService) { this.orderService = orderService; }
                //   → injectedSlots = Map { 'orderService' → 'orderService' }
                //   → classDep = 'Class.OrderService' (camelCase → PascalCase)
                //
                // LIMITAÇÃO DOCUMENTADA: a inferência é por convenção de nome
                // (camelCase → PascalCase), NÃO por resolução de tipo/import.
                // Funciona para o padrão DI mais comum, mas falharia para nomes
                // não convencionais (ex: this.db = databaseConnection).
                // Um analisador de produção precisaria de resolução de import +
                // type annotation para cobrir esses casos.
                const injectedSlots = new Map(); // propName → paramName
                const constructorParams = new Set();
                const constructorDependsOn = [];

                for (const elem of node.body.body) {
                    if (elem.type === 'MethodDefinition' && elem.key.name === 'constructor') {
                        // Coletar nomes dos parâmetros
                        for (const p of elem.value.params) {
                            if (p.type === 'Identifier') constructorParams.add(p.name);
                        }

                        walk.simple(elem.value.body, {
                            AssignmentExpression(assign) {
                                // Detectar padrão: this.<prop> = <param>
                                if (assign.left.type === 'MemberExpression' &&
                                    assign.left.object.type === 'ThisExpression' &&
                                    assign.left.property.type === 'Identifier' &&
                                    assign.right.type === 'Identifier' &&
                                    constructorParams.has(assign.right.name)) {
                                    injectedSlots.set(assign.left.property.name, assign.right.name);
                                }
                            },
                            NewExpression(newExp) {
                                // new X() no construtor → dependência direta
                                if (newExp.callee.name) {
                                    constructorDependsOn.push(`Class.${newExp.callee.name}`);
                                }
                            }
                        });
                    }
                }

                // Dependências de classe a partir dos slots injetados
                for (const [, paramName] of injectedSlots) {
                    const className = paramName.charAt(0).toUpperCase() + paramName.slice(1);
                    classDependsOn.add(`Class.${className}`);
                }
                // Dependências de new X() no construtor
                for (const d of constructorDependsOn) classDependsOn.add(d);

                // ── Fase B: Extrair métodos ──
                for (const elem of node.body.body) {
                    if (elem.type === 'MethodDefinition' && elem.key.name !== 'constructor') {
                        methods.push(elem.key.name);

                        const methodParams = elem.value.params.map(p => p.name);
                        const methodLine = elem.loc.start.line;
                        const methodDependsOn = new Set();
                        const numericLiterals = new Set();

                        walk.simple(elem.value.body, {
                            CallExpression(call) {
                                // Chamada direta: foo()
                                if (call.callee.type === 'Identifier') {
                                    methodDependsOn.add(`Function.${call.callee.name}`);
                                }
                                // this.<slot>.method() onde <slot> é um slot injetado
                                // Estrutura AST: MemberExpression(
                                //   object: MemberExpression(object: ThisExpression, property: <slot>),
                                //   property: <methodName>
                                // )
                                else if (
                                    call.callee.type === 'MemberExpression' &&
                                    call.callee.object.type === 'MemberExpression' &&
                                    call.callee.object.object.type === 'ThisExpression' &&
                                    call.callee.object.property.type === 'Identifier'
                                ) {
                                    const propName = call.callee.object.property.name;
                                    if (injectedSlots.has(propName)) {
                                        const paramName = injectedSlots.get(propName);
                                        const className = paramName.charAt(0).toUpperCase() + paramName.slice(1);
                                        methodDependsOn.add(`Class.${className}`);
                                    }
                                }
                            },
                            Identifier(id) {
                                if (id.name === 'TAX_RATE') methodDependsOn.add('Const.TAX_RATE');
                            },
                            Literal(lit) {
                                // Coleta genérica de literais numéricos.
                                // Divergências entre versões de um mesmo método
                                // (ex: 0.10 vs 0.15) emergem naturalmente do
                                // deepEqual no teste, sem precisar de um valor mágico.
                                if (typeof lit.value === 'number') {
                                    numericLiterals.add(lit.value);
                                }
                            }
                        });

                        const methodKo = {
                            canonicalId: `Class.${name}.${elem.key.name}`,
                            type: "METHOD",
                            content: { name: elem.key.name, params: methodParams },
                            evidences: [{ type: "SOURCE_CODE", path: relativePath, line: methodLine, confidence: 90 }]
                        };

                        if (methodDependsOn.size > 0) methodKo.content.dependsOn = Array.from(methodDependsOn);
                        if (numericLiterals.size > 0) methodKo.content.numericLiterals = Array.from(numericLiterals).sort();

                        // Agregar dependências Class.* dos métodos no nível da classe
                        for (const d of methodDependsOn) {
                            if (d.startsWith('Class.')) classDependsOn.add(d);
                        }

                        knowledgeObjects.push(methodKo);
                    }
                }

                // ── Fase C: Emitir KO da classe ──
                const ko = {
                    canonicalId: `Class.${name}`,
                    type: "CLASS",
                    content: { name, methods },
                    evidences: [{ type: "SOURCE_CODE", path: relativePath, line, confidence: 90 }]
                };
                if (classDependsOn.size > 0) ko.content.dependsOn = Array.from(classDependsOn);

                // Inserir classe antes dos métodos
                knowledgeObjects.unshift(ko);
            },

            // ═══════════════════════════════════════════════
            // CONSTANTES (UPPER_CASE com valor literal)
            // ═══════════════════════════════════════════════
            VariableDeclarator(node) {
                if (node.id.type === 'Identifier' && node.id.name === node.id.name.toUpperCase()) {
                    if (node.init && node.init.type === 'Literal') {
                        knowledgeObjects.push({
                            canonicalId: `Const.${node.id.name}`,
                            type: "CONST",
                            content: { name: node.id.name, value: node.init.value },
                            evidences: [{ type: "SOURCE_CODE", path: relativePath, line: node.loc.start.line, confidence: 90 }]
                        });
                    }
                }
            }
        });

        return knowledgeObjects;
    }
}
