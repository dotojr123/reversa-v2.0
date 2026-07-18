# KOS-016: Knowledge History Model

**Version:** 1.0
**Status:** Oficial

O Modelo de Histórico resolve a consulta temporal ("Como a Regra 001 evoluiu?"). Ele agrupa todas as revisões sofridas por uma entidade específica ao longo dos Commits.

## Estrutura do Histórico

```json
{
  "canonicalId": "RULE-001",
  "versions": [
    {
      "commitId": "commit-uuid-1234",
      "timestamp": 1690000000000,
      "author": "scanner",
      "action": "added"
    },
    {
      "commitId": "commit-uuid-1288",
      "timestamp": 1690005000000,
      "author": "mcp-agent",
      "action": "updated",
      "diff": {
        "confidence": { "old": 0.8, "new": 0.95 }
      }
    }
  ],
  "schemaVersion": "KOS-016"
}
```

Essa estrutura serve como ponte perfeita antes da migração para um Graph Database temporal robusto, pois pode ser derivada fazendo Replay puro de uma tabela local de Commits (SQLite).
