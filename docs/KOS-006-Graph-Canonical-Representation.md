# KOS-006: Graph Canonical Representation

**Version:** 1.0
**Status:** Oficial

Este documento define o formato oficial abstrato de como um Nó (GraphNode) e uma Aresta (GraphEdge) devem existir estruturalmente em memória e em repasse aos provedores. Qualquer banco de dados de grafos mapeará essas propriedades estritas.

## 1. GraphNode Specification

```json
{
  "id": "string (UUID herdado do Knowledge Object)",
  "canonicalId": "string (Opcional, repassado do KO)",
  "labels": ["string", "string"], 
  "properties": {
    // Propriedades nativas do nó. (ex: language="Go", layer="backend")
  },
  "metadata": {
    // Rastreio da plataforma. (ex: businessId="RULE-001")
  },
  "confidence": "float (0 a 100)",
  "version": "integer",
  "evidenceCount": "integer"
}
```

## 2. GraphEdge Specification

```json
{
  "id": "string (UUID v4 da relação)",
  "source": "string (UUID do nó de origem)",
  "target": "string (UUID do nó de destino)",
  "type": "string (Semântica KOS-005, ex: CALLS, DEPENDS_ON)",
  "weight": "float (Padrão 1.0)",
  "confidence": "float (Herdado da origem ou recalculado)",
  "evidenceCount": "integer (Quantas evidências amparam essa relação)",
  "createdAt": "ISO 8601 UTC",
  "updatedAt": "ISO 8601 UTC",
  "properties": {
    // Dados extras se necessário na relação (ex: lineNumber da chamada)
  }
}
```
