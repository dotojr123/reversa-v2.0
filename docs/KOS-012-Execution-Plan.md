# KOS-012: Execution Plan Model

**Version:** 1.0
**Status:** Oficial

Contrato gerado pelo `RetrievalPlanner`. Ele não executa a busca, ele apenas define *como* a busca deverá ser conduzida pelas camadas subsequentes (Retrieval Pipeline). 

## Estrutura do Plano de Execução

```json
{
  "planner": "hybrid",
  "steps": [
    "keyword",
    "graph",
    "ranking",
    "context",
    "prompt"
  ],
  "parameters": {
    "keywordDepth": 1,
    "graphDepth": 3
  },
  "fallbacks": [
    "temporal"
  ]
}
```

O `RetrievalPipeline` lerá o array `steps` e executará cada provider na ordem especificada.
