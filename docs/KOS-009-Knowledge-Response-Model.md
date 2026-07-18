# KOS-009: Knowledge Response Model

**Version:** 1.0
**Status:** Oficial

A saída padronizada (Response) que o `Knowledge Services` retorna aos clientes após a montagem pelo `ContextAssembly` e `ExplanationEngine`. 

## Estrutura de Retorno

```json
{
  "knowledge": [
    // Array de KnowledgeObjects recuperados puros
  ],
  "graph": {
    "nodes": [],
    "edges": []
  },
  "evidence": [
    // Array consolidado de evidências que amparam esta resposta
  ],
  "conflicts": [
    // Conflitos mapeados neste conjunto recuperado
  ],
  "metrics": {
    "latencyMs": 145,
    "cacheHit": false
  },
  "traceId": "trace-uuid-1234"
}
```
