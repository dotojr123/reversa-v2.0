# KOS-010: Knowledge Context Model

**Version:** 1.0
**Status:** Oficial

Este contrato padroniza o payload que o `ContextAssembly` monta. Este objeto estruturado é injetado diretamente nos construtores de prompts para LLMs.

## Estrutura do Dossiê de Contexto

```json
{
  "rules": [
    // Array de regras de negócio destiladas
  ],
  "modules": [
    // Dependências e componentes modulares
  ],
  "entities": [
    // Entidades de banco/dados relacionadas
  ],
  "apis": [
    // Endpoints consumidos ou expostos no escopo
  ],
  "graph": [
    // Sub-grafo textualizado ("A CALLS B")
  ],
  "evidence": [
    // Fontes base (Testes, Linhas de código)
  ],
  "summary": "String resumida gerada pela agregação do contexto.",
  "confidence": 0.93
}
```
