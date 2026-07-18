# Fixtures ausentes (Sprint 6a)

Esta pasta deveria conter as fixtures originais para o teste `scanner.test.js`.
Originalmente, a fixture consistia em 8 arquivos fonte e 1 gabarito JSON, simulando um ambiente com dependências circulares (ex: `UserService <-> OrderService`) e arquivos legados duplicados.

Arquivos que precisam ser recriados para que o teste passe:
1. `src/index.js`
2. `src/services/UserService.js`
3. `src/services/OrderService.js`
4. `src/utils/validators.js`
5. `src/utils/formatters.js`
6. `src/config/constants.js`
7. `src/legacy/validatorsCopy.js`
8. `src/legacy/OrderServiceV2.js`
9. `gabarito/scanner-expected.json`

Se você é o mantenedor, por favor recrie esses arquivos para validar a lógica de extração AST determinística do `Scanner.js`.
