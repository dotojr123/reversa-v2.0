# KOS-015: Knowledge Commit Model

**Version:** 1.0
**Status:** Oficial

O Commit é o bloco fundamental do Version Control System (VCS) do Reversa. Ao invés de mutar o estado instantaneamente, as mudanças de conhecimento (arquivos parseados, grafos inferidos) geram um Commit atômico. 

## Estrutura do Commit

```json
{
  "id": "commit-uuid-1234",
  "parent": "commit-uuid-1233",
  "timestamp": 1690000000000,
  "author": "scanner",
  "reason": "File modification detected: src/auth.js",
  "changeset": {
    "added": ["KO-001", "KO-002"],
    "updated": ["KO-003"],
    "removed": []
  },
  "graphChanges": {
    "addedNodes": 2,
    "addedEdges": 4,
    "removedNodes": 0,
    "removedEdges": 0
  },
  "knowledgeHash": "sha256-abc123def456",
  "schemaVersion": "KOS-015"
}
```

- **id**: Identificador único da revisão.
- **parent**: O commit anterior. Permite criar uma linked list para histórico e replay.
- **changeset**: Lista de Canonical IDs alterados (diff de Knowledge Objects).
- **graphChanges**: O resumo estatístico ou o changeset em lote para o grafo (GraphChangeSet).
- **knowledgeHash**: O hash consolidado da base neste exato timestamp, provando imutabilidade.
