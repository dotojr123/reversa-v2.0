# Fixture Sprint 6a/6b — PENDENTE DE RECRIAÇÃO

Os arquivos abaixo existiam apenas em
`C:\Users\Doto\Downloads\reversa-fixture-sprint6a\fixture` na máquina original
e nunca foram commitados neste repositório. `scanner.test.js` e
`ingest_e2e.test.js` dependem desta estrutura:

```
tests/fixtures/sprint6a/
├── gabarito/
│   └── scanner-expected.json   # ver estrutura esperada em scanner.test.js (função normalize())
└── src/
    ├── index.js
    ├── services/UserService.js
    ├── services/OrderService.js
    ├── utils/validators.js
    ├── utils/formatters.js
    ├── config/constants.js
    ├── legacy/validatorsCopy.js       # duplicata proposital de validators.js (dedup limpo)
    └── legacy/OrderServiceV2.js       # duplicata CONFLITANTE de OrderService.js (createOrder diverge)
```

Requisitos funcionais que o fixture precisa cumprir (extraídos dos asserts do teste):
- `Function.validateEmail` e `Class.OrderService` devem aparecer 2x com `content` IDÊNTICO (dedup limpo)
- `Class.OrderService.createOrder` deve aparecer 2x com `content` DIFERENTE (conflito)
- `UserService` e `OrderService` devem ter `dependsOn` circular entre si
- `Function.formatCurrency`, `Const.TAX_RATE`, `Const.CURRENCY`, `Function.validateAmount`,
  `Function.bootstrap` devem aparecer exatamente 1x (grupo de controle)
- `gabarito.counts.total_raw_evidences` = contagem total esperada
- `gabarito.counts.duplicates_for_dedup_merge` = 2
