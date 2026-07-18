# KOS-003: Graph Mapping

**Version:** 1.0
**Status:** Oficial

Este documento descreve como um `KnowledgeObject` abstrato é quebrado e convertido em uma estrutura de vértices (`GraphNode`) e arestas (`GraphEdge`) pelo `GraphBuilder` e `RelationshipResolver`.

## 1. O Fluxo de Mapeamento

Nenhum provedor de grafos consome o `KnowledgeObject` puro. O pipeline garante a conversão:

```text
KnowledgeObject
       │
       ▼
RelationshipResolver (Infere e estende relacionamentos implícitos usando Contexto)
       │
       ▼
GraphBuilder (Aplica regras de KOS-003 e converte para nós/arestas)
       │
       ▼
Graph (Grafo em Memória: Sub-Rede)
       │
       ▼
GraphService / ArchitectureValidator
```

## 2. Regras de Conversão

### 2.1 Identidades Primárias (The Root Node)
Cada `KnowledgeObject` sempre resulta em, no mínimo, **um** nó raiz no grafo.
- A propriedade `uuid` do Knowledge Object torna-se o `id` do GraphNode.
- A propriedade `canonicalId` e `businessId` vão para o objeto `metadata`.
- O `type` do Knowledge Object define a taxonomia base no array `labels` (ex: `['Software', 'BusinessRule']`).

### 2.2 Relacionamentos Explícitos (The Edges)
Se o `KnowledgeObject.content` declarar relacionamentos diretos (ex: `dependsOn: ['MODULE-002']`), o `GraphBuilder` gera `GraphEdge`s vinculando o nó raiz aos respectivos alvos.
- O tipo do link (`CALLS`, `USES`, etc) é extraído do schema do `content`.
- O peso da aresta (`weight`) recebe 1.0 por padrão.
- O `confidence` da aresta herda o `confidence` da raiz do Knowledge Object.

### 2.3 Relacionamentos Implícitos (O Papel do RelationshipResolver)
Muitas vezes o Scanner captura dados não declarados.
Por exemplo, uma `API` que recebe um payload com nome de uma `Entity`.
O `RelationshipResolver`:
1. Consulta o `KnowledgeContext` para achar a `Entity`.
2. Adiciona o relacionamento implícito `USES` antes do Builder construir.
3. Essas arestas geradas ganham `metadata.inferred = true`.

## 3. Propagação de Métricas
- O `confidenceScore` do `KnowledgeObject` torna-se a `confidence` do Node primário.
- A quantidade do array `evidences` do KO mapeia diretamente para a propriedade primitiva `evidenceCount` do Node e das Edges geradas a partir dele.
