# KOS-001: Knowledge Object Specification

**Version:** 1.0
**Status:** Oficial (Congelado para Core V2)

## 1. Visão Geral

O **Knowledge Object** é o contrato oficial de troca de dados do ecossistema Reversa KOS.
Nenhum plugin, agente, exportador ou provedor de grafo deve depender da implementação interna do banco de dados, mas sim **estritamente** desta especificação canônica JSON.

## 2. Identificação Tripla

Para suportar Grafos, MCP e deduplicação semântica, o modelo utiliza 3 níveis de identificação:

1. **UUID (String):** Identifica a *instância* unívoca persistida do conhecimento. (ex: `550e8400-e29b-41d4-a716-446655440000`)
2. **Business ID (String):** Identifica para leitura humana e rastreabilidade no projeto. (ex: `RULE-000234`)
3. **Canonical ID (String):** Identifica o *significado/contexto semântico*. (ex: `payment.requires-active-account`)

## 3. Modelo Canônico (Knowledge Object)

```json
{
  "uuid": "string (v4)",
  "businessId": "string",
  "canonicalId": "string",
  "type": "string (ex: RULE, ENTITY, REQUIREMENT)",
  "schemaVersion": "1.0",
  "knowledgeVersion": "integer (incremental)",
  "content": {
    // Payload dinâmico dependente do 'type'
  },
  "confidenceScore": "float (0 a 100)",
  "evidences": [
    // Array de objetos Evidence
  ],
  "conflicts": [
    // Array de UUIDs ou Canonical IDs conflitantes
  ],
  "createdAt": "ISO 8601 UTC",
  "updatedAt": "ISO 8601 UTC",
  "createdBy": "string (identificador do agente ou plugin criador)",
  "updatedBy": "string"
}
```

## 4. Evidence Model

Um `Knowledge Object` deduzido, mergeado e avaliado é sustentado por um ou mais objetos `Evidence`.

```json
{
  "id": "string (UUID v4)",
  "agent": "string (ex: Bug Fix, Explorer)",
  "provider": "string (ex: LLM, Scanner, Parser)",
  "type": "enum (SOURCE_CODE, DOCUMENT, LOG, API, TEST, USER, LLM)",
  "source": "string (Nome do arquivo, endpoint ou autor)",
  "path": "string (caminho físico se aplicável)",
  "line": "integer (opcional)",
  "column": "integer (opcional)",
  "raw": "string (conteúdo original que embasa a evidência)",
  "metadata": "object (chave/valor livre)",
  "confidence": "float (0 a 100 base para o Provider Reliability)",
  "timestamp": "ISO 8601 UTC"
}
```

## 5. Conflict Model

Usado internamente e exportado para expor divergências lógicas ou estruturais.

```json
{
  "id": "string (UUID v4)",
  "severity": "enum (LOW, MEDIUM, HIGH, BLOCKER)",
  "type": "enum (STRUCTURAL, SEMANTIC, LOGICAL)",
  "ruleA": "string (Canonical ID ou UUID A)",
  "ruleB": "string (Canonical ID ou UUID B)",
  "reason": "string (Explicação do conflito gerada pelo ConflictProcessor)",
  "resolver": "string (Agente ou humano que resolveu o conflito)",
  "status": "enum (OPEN, RESOLVED, IGNORED)"
}
```

## 6. Compatibilidade

Qualquer engine (SQLiteProvider, GraphProvider) deve ser capaz de serializar e desserializar exatamente esta estrutura. 
O pipeline de exportação e a detecção de inferência dependerão **somente** desses campos para gerar os artefatos (Mermaid, Markdown, Neo4j Nodes).
