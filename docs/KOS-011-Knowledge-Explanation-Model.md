# KOS-011: Knowledge Explanation Model

**Version:** 1.0
**Status:** Oficial

Garante o nível de Explicabilidade (XAI) do sistema. Toda resposta gerada deve acompanhar a prova matemática e de rastreio de *por que* aquele dado foi selecionado.

## Estrutura da Árvore de Explicação

```json
{
  "why": [
    "Retornado por similaridade textual exata na regra X.",
    "Vinculado através de dependência arquitetural Y."
  ],
  "tree": {
    "nodeId": "uuid-principal",
    "children": [
      { "type": "Rule", "id": "rule-1" },
      { "type": "Evidence", "id": "ev-5" }
    ]
  },
  "sources": [
    "src/auth/login.js:45"
  ],
  "ranking": {
    "confidenceScore": 0.95,
    "distancePenalty": 0.05,
    "recencyBonus": 0.10
  },
  "strategy": "hybrid"
}
```
