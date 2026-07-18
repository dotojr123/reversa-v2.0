# KOS-004: Query Language

**Version:** 1.0
**Status:** Oficial

Este documento padroniza a interface declarativa de consultas de domínio de conhecimento no Reversa KOS. Esta linguagem abstrai os jargões de backend (como Cypher do Neo4j, GraphQL ou SQL), unificando a forma que o MCP e os Exporters solicitam informações à plataforma.

## 1. Rationale (Por que não usar Cypher direto?)
Se o `GraphProvider` expor o Cypher puro, a plataforma fica travada ao Neo4j. Criando um DSL (Domain Specific Language) simplificado, o Reversa dita o formato semântico e o provedor encarrega-se de transpilar para o dialecto final.

## 2. Sintaxe Declarativa Básica

A query KOS segue a semântica `[AÇÃO] [ALVO] FROM/MATCH [ORIGEM] [CONDIÇÕES]`.

### 2.1 FIND
Busca um caminho, impacto ou conjunto estruturado.

```text
FIND impact
FROM API "login"
DEPTH 3
```
*Tradução:* O provedor encontra a API com canonical ID `login` e navega nas arestas do tipo "forward" até o nível 3.

```text
FIND dependencies
FROM Module "Payment"
```
*Tradução:* Encontra todos os nós que apontam (reverse edges) ou os nós para os quais o Payment aponta (forward edges).

### 2.2 MATCH
Consulta clássica de nós por filtro estrito de domínios (KOS-002).

```text
MATCH Module
WHERE language = "Go"
RETURN dependencies
```
*Tradução:* Busca nós com `label: ['Module']`, avalia a `properties.language`, retornando apenas a lista de arestas dependentes.

### 2.3 TRACE
Mapeia caminhos diretos (Shortest Path) entre dois contextos.

```text
TRACE API "Login"
TO Database "UserDB"
```
*Tradução:* O Provedor implementa `shortestPath()` ou o equivalente entre os dois Canonical IDs.

## 3. Implementação
Para a Fase Inicial, a "Linguagem" não precisa necessariamente de um lexer/parser complexo em string. Ela pode ser implementada via **Builder Pattern** no código (Fluent API):

```js
kosQuery.match('Module')
        .where('language', 'Go')
        .return('dependencies');
        
kosQuery.trace('API:Login').to('Database:UserDB');
```
O `GraphProvider.query(queryObj)` receberá o objeto AST montado por essa API fluente, transpilando-o para Cypher (no caso do Neo4j) ou recursão local (no caso do Graphiti primitivo).
