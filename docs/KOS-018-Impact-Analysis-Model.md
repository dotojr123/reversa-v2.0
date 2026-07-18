# KOS-018: Impact Analysis Model

**Version:** 1.0
**Status:** Oficial

Especifica o formato de payload retornado pelo *ImpactProvider* para quantificar o risco de alterações estruturais e semânticas sobre um determinado nó da arquitetura.

## Estrutura do Relatório

O relatório separa os danos garantidos (via AST) dos riscos potenciais de negócio (via Memória Episódica).

```json
{
  "targetId": "module::orders::service",
  "deterministicBlastRadius": [
    {
      "canonicalId": "module::orders::controller",
      "type": "CLASS",
      "riskLevel": "CRITICAL",
      "distance": 1,
      "edgeType": "hard",
      "reason": "Dependência estrutural direta."
    }
  ],
  "probabilisticRisks": [
    {
      "canonicalId": "module::invoices::generator",
      "type": "FUNCTION",
      "riskLevel": "WARNING",
      "distance": 2,
      "edgeType": "soft",
      "confidence": 0.85,
      "reason": "Similaridade conceitual ou relacionamento em episódios passados."
    }
  ],
  "impactScore": 8.5,
  "explanationTree": {
    "strategy": "hybrid_impact",
    "summary": "Risco Crítico. Quebra 1 componente e possui similaridade com 1 regra de negócio adjacente."
  }
}
```

### Regras de Ouro
1. **Hard Edges** geram dano determinístico (CRITICAL).
2. **Soft Edges** geram alertas semânticos (WARNING / NOTICE).
3. **ImpactScore** é a consolidação numérica da gravidade.
