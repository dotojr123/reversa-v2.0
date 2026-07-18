# KOS-002: Graph Specification (Domain Model)

**Version:** 1.0
**Status:** Oficial

Este documento define os tipos primitivos de Nós e Arestas do ecossistema Reversa KOS, garantindo uma representação uniforme que transcende o código-fonte, englobando dados e infraestrutura.

## 1. Node Types (Domínios de Nós)

Os nós do grafo representam instâncias de conhecimento e são estritamente classificados em quatro domínios.

### 1.1 Domínio de Software
Componentes lógicos e estruturais do código-fonte.
- **`Module`**: Um agrupador lógico (ex: pacote, diretório).
- **`Package`**: Um módulo versionável ou biblioteca.
- **`Namespace`**: Um escopo de nomes lógicos.
- **`Class`**: Uma estrutura de classe orientada a objetos.
- **`Interface`**: Um contrato estrutural.
- **`Function`**: Uma rotina independente.
- **`Method`**: Uma rotina acoplada a uma classe.
- **`API`**: Uma interface de programação abstrata.
- **`Endpoint`**: Um ponto de acesso específico (REST/GraphQL).
- **`Entity`**: Um modelo de domínio de negócios.
- **`BusinessRule`**: Uma regra de negócio abstraída.
- **`Test`**: Uma suíte ou caso de teste.
- **`Document`**: Um arquivo de documentação (MD, PDF).
- **`Configuration`**: Um artefato de parametrização (JSON, YAML).

### 1.2 Domínio de Dados
Elementos relacionados a armazenamento e troca de informações.
- **`Database`**: Instância lógica de um banco.
- **`Schema`**: Coleção lógica de tabelas.
- **`Table`**: Entidade relacional.
- **`Column`**: Propriedade de uma tabela.
- **`Index`**: Índice de busca.
- **`View`**: Projeção de dados.
- **`StoredProcedure`**: Rotina armazenada.
- **`Queue`**: Fila de mensagens (ex: RabbitMQ).
- **`Topic`**: Tópico de publicação (ex: Kafka).
- **`Cache`**: Instância de armazenamento efêmero.

### 1.3 Domínio de Infraestrutura
Componentes de implantação, execução e redes.
- **`Application`**: Uma aplicação completa (front + back).
- **`Service`**: Um microsserviço ou daemon rodando.
- **`Container`**: Uma unidade de deploy em runtime (ex: Docker).
- **`Image`**: Um binário ou artefato de container.
- **`Deployment`**: Definição de implantação.
- **`Host`**: Máquina física ou VM.
- **`Cluster`**: Conjunto de hosts.
- **`Region`**: Zona de disponibilidade.
- **`Secret`**: Credencial ou chave sensível.
- **`Volume`**: Armazenamento em bloco ou arquivo.
- **`Network`**: Topologia de rede ou subnet.

### 1.4 Domínio Externo
Dependências gerenciadas fora do controle direto da aplicação.
- **`ThirdPartyAPI`**: Um serviço externo (ex: Stripe, SendGrid).
- **`SDK`**: Kit de desenvolvimento externo.
- **`Library`**: Biblioteca de terceiros estática.
- **`Framework`**: Estrutura base de desenvolvimento (ex: React, Spring).
- **`Provider`**: Um provedor de nuvem ou infraestrutura (ex: AWS).

## 2. Edge Types (Categorias de Relacionamentos)
*(A semântica exata de cada aresta está definida no KOS-005)*

- `CALLS`
- `USES`
- `IMPLEMENTS`
- `DEPENDS_ON`
- `GENERATES`
- `OWNS`
- `VALIDATES`
- `READS`
- `WRITES`

## 3. Propriedades Comuns dos Nós
*(A estrutura canônica JSON está definida no KOS-006)*

Todo nó KOS no grafo **deve** possuir:
- **`labels`**: Array contendo a taxonomia (ex: `['Software', 'Function']`).
- **`properties`**: Dados abertos, chaves e valores.
- **`metadata`**: Contexto do KOS, origem, etc.
- **`confidence`**: Score (0-100) refletindo a soma de evidências.
- **`version`**: Versão do nó (incrementado em merges).
- **`evidenceCount`**: Quantidade de evidências atreladas.
