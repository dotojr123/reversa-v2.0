# KOS-013: Metrics Model

**Version:** 1.0
**Status:** Oficial

Centraliza e padroniza as métricas e tempos de execução (Spans/Observability) de cada requisição processada pelo Knowledge Runtime, pronto para exportação para o OpenTelemetry futuramente.

## Estrutura do Modelo de Métricas

```json
{
  "traceId": "trace-1234",
  "spans": {
    "gateway": { "start": 1690000000, "end": 1690000100, "durationMs": 100 },
    "planner": { "start": 1690000005, "end": 1690000010, "durationMs": 5 },
    "keyword": { "start": 1690000010, "end": 1690000030, "durationMs": 20 },
    "graph": { "start": 1690000030, "end": 1690000070, "durationMs": 40 },
    "ranking": { "start": 1690000070, "end": 1690000085, "durationMs": 15 },
    "explanation": { "start": 1690000085, "end": 1690000095, "durationMs": 10 }
  },
  "cache": {
    "hit": false,
    "ratio": 0.0
  }
}
```
