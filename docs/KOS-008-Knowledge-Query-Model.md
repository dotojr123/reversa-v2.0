# KOS-008: Knowledge Query Model

**Version:** 1.0
**Status:** Oficial

Especifica o formato universal de consultas (Queries e Commands) que o Gateway e o Request Router aceitam de qualquer protocolo externo (REST, MCP, CLI).

## Estrutura da Query

```json
{
  "query": "Como funciona a autenticação no sistema?",
  "strategy": "hybrid",
  "limit": 20,
  "depth": 3,
  "confidenceThreshold": 0.8,
  "filters": {
    "module": "Auth",
    "language": "js"
  },
  "context": {
    "workspaceId": "ws-123",
    "sessionId": "sess-456"
  }
}
```

- **query:** String livre. Pode ser uma keyword, texto semântico ou comando estrito.
- **strategy:** A diretiva de busca solicitada (ex: `keyword`, `graph`, `hybrid`, `semantic`, `temporal`). Se omitida, o `QueryPlanner` inferirá automaticamente a melhor estratégia.
- **limit:** Limite de resultados (Nós ou Grafos).
- **depth:** Nível máximo de travessia (usado quando a estratégia é Graph).
- **confidenceThreshold:** Ignora conhecimentos abaixo desta linha de corte (ex: 0.8 = 80%).
