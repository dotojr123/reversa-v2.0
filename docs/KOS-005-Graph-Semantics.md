# KOS-005: Graph Semantics

**Version:** 1.0
**Status:** Oficial

Define estritamente o significado das arestas (relacionamentos) mapeados pelo KOS-002, garantindo que plugins, visualizadores e a linguagem KOS-004 interpretem os grafos uniformemente.

## 1. Semânticas Fundamentais

- **`CALLS`**: Significa execução direta no código.
  - *Exemplo:* (Function A) -[CALLS]-> (Function B)
- **`DEPENDS_ON`**: Significa dependência de projeto, biblioteca ou estrutura fundamental.
  - *Exemplo:* (Module Payment) -[DEPENDS_ON]-> (Module Auth)
- **`USES`**: Significa utilização indireta de recursos ou infraestrutura.
  - *Exemplo:* (Application) -[USES]-> (Database)
- **`IMPLEMENTS`**: Significa implementação formal de um contrato.
  - *Exemplo:* (Class StripeProvider) -[IMPLEMENTS]-> (Interface PaymentProvider)
- **`GENERATES`**: Significa que a origem produz ativamente o destino (ex: novos dados, instâncias ou conhecimento).
  - *Exemplo:* (Service) -[GENERATES]-> (Log)
- **`OWNS`**: Relação de posse hierárquica ou contenção.
  - *Exemplo:* (Package) -[OWNS]-> (Module)
- **`VALIDATES`**: Executa validação de regras de domínio ou testes.
  - *Exemplo:* (Test) -[VALIDATES]-> (BusinessRule)
- **`READS`**: Consome estado ou dados de um armazenamento sem mutá-los.
  - *Exemplo:* (Service) -[READS]-> (Table)
- **`WRITES`**: Altera estado ou persiste dados em um armazenamento.
  - *Exemplo:* (Service) -[WRITES]-> (Table)
