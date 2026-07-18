# KOS-007: Graph Change Set Specification

**Version:** 1.0
**Status:** Oficial

Define o formato canônico das mudanças a serem aplicadas na base de grafos (seja Memory, Neo4j, etc). Em vez de recriar grafos do zero, o sistema propaga esse JSON diff entre as sessões.

## 1. O Formato Change Set

```json
{
  "addedNodes": [
    // Array de GraphNodes completos
  ],
  "updatedNodes": [
    // Array de GraphNodes que sofreram merge ou alteração
  ],
  "removedNodes": [
    // Array de GraphNodes (ou apenas seus IDs)
  ],
  "unchangedNodes": 15,
  "addedEdges": [
    // Array de GraphEdges completas
  ],
  "updatedEdges": [
    // Array de GraphEdges alteradas (peso, etc)
  ],
  "removedEdges": [
    // Array de GraphEdges removidas
  ],
  "unchangedEdges": 42
}
```

## 2. Garantias do Pipeline
- O `GraphSyncEngine` é inteiramente responsável por gerar este ChangeSet usando o `Planner` a partir de um `KnowledgeObject` e de consultas ao `GraphIndex`.
- O `GraphProvider` (como `Neo4jProvider`) apenas iterará as arrays `added*`, `updated*` e `removed*` chamando internamente os métodos nativos (ex: `bulkSave`, `bulkUpdate`).
