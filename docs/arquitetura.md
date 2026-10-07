# Arquitetura

## Visão geral

O sistema é um back-end monolítico organizado em camadas, construído com NestJS e TypeScript. A escolha pelo monolito segue a orientação do desafio para um MVP: um único artefato, simples de executar e de operar, com os contextos de negócio separados internamente por módulos.

Cada módulo representa um contexto e é dividido em quatro camadas, no estilo Clean Architecture (ports and adapters):

- **domain**: entidades, agregados, objetos de valor, eventos e as portas de repositório. Não depende de framework nem de banco.
- **application**: casos de uso que orquestram o domínio e definem os limites de transação.
- **infrastructure**: implementações concretas (TypeORM, autenticação JWT, adaptadores entre contextos).
- **interface**: controllers REST, DTOs validados e documentação Swagger.

A regra de dependência aponta sempre para dentro: interface e infrastructure dependem de application e domain; o domínio não conhece as camadas externas. Essa separação mantém as regras de negócio isoladas e é o que torna possível testá-las sem subir banco ou servidor, sustentando a cobertura exigida nos domínios críticos.

## Estrutura de módulos

| Módulo | Contexto | Responsabilidade |
|--------|----------|------------------|
| `ordens-servico` | Atendimento (core) | Ciclo de vida da OS, orçamento, acompanhamento, consulta pública e tempo médio. |
| `clientes` | Cadastro | CRUD de clientes, validação de CPF e CNPJ. |
| `veiculos` | Cadastro | CRUD de veículos, validação de placa. |
| `servicos` | Catálogo | CRUD de serviços. |
| `pecas` | Catálogo e Estoque | CRUD de peças e controle de estoque. |
| `auth` | Identidade e Acesso | Autenticação JWT das APIs administrativas. |
| `shared` | Núcleo compartilhado | Bases de domínio, Dinheiro, exceções, transações. |

## Comunicação entre contextos

O núcleo de Ordens de Serviço não acessa diretamente o modelo dos outros contextos. Ele declara portas na camada de aplicação (`CatalogoDeServicos`, `GestaoDeEstoque`, `ConsultaDeCliente`, `ConsultaDeVeiculo`) e recebe adaptadores que traduzem essas portas para os repositórios dos contextos de catálogo e cadastro. Isso reduz o acoplamento e deixa explícito o que o núcleo precisa de cada contexto.

## Decisão e justificativa do banco de dados

O banco escolhido foi o **PostgreSQL**.

Motivos:

- **Transações ACID**: o fluxo de aprovação do orçamento altera a Ordem de Serviço e baixa o estoque das peças em uma única operação. Esses dois efeitos precisam acontecer juntos ou nenhum deles. Um banco relacional transacional atende isso de forma direta e confiável.
- **Integridade referencial**: cliente, veículo, serviço, peça e ordem têm relações bem definidas. O modelo relacional expressa e protege essas relações.
- **Dados estruturados e estáveis**: o domínio da oficina é tabular e tem baixo índice de mudança de esquema. Não há necessidade de um banco de documentos.
- **Maturidade e custo**: PostgreSQL é gratuito, maduro, amplamente suportado e roda sem fricção em contêiner.

O acesso ao banco usa TypeORM. Em desenvolvimento, o esquema é sincronizado automaticamente. Os testes de integração usam um banco relacional em memória compatível (sql.js), o que permite exercitar o mesmo mapeamento e as mesmas transações sem depender de um servidor externo.

## Tratamento de transações

As transações são tratadas por uma Unidade de Trabalho (padrão Unit of Work):

- A porta `UnidadeDeTrabalho` expõe um método `executar(operacao)`.
- A implementação sobre TypeORM abre uma transação e publica o `EntityManager` transacional em um `ContextoDeTransacao` baseado em `AsyncLocalStorage`.
- Os repositórios leem esse contexto e, quando há transação ativa, usam o manager dela. Com isso participam automaticamente da mesma transação, sem precisar receber o manager em cada chamada.

Os casos de uso que alteram estado rodam dentro de `unidadeDeTrabalho.executar(...)`. Qualquer exceção provoca rollback. O exemplo mais relevante é a aprovação do orçamento: se o estoque for insuficiente, a baixa falha, a transação é desfeita e a ordem permanece em Aguardando aprovação. Esse comportamento é verificado no teste de integração.

## Segurança

- Autenticação JWT nas APIs administrativas, via Passport. O token é emitido no login e exigido por um guard nas rotas internas.
- Senhas armazenadas apenas como hash (bcrypt).
- Validação de entrada em duas frentes: DTOs com class-validator na borda HTTP e objetos de valor no domínio (CPF, CNPJ e placa validam a si mesmos).
- Cabeçalhos de segurança HTTP com Helmet.
- A consulta pública de acompanhamento não expõe dados sem verificação: exige o código da ordem e o documento do cliente correspondente.

## Decisões registradas

| Decisão | Alternativa considerada | Motivo da escolha |
|---------|-------------------------|-------------------|
| Monolito em camadas | Microsserviços | É um MVP. Monolito reduz complexidade operacional. |
| Clean Architecture por módulo | Camadas técnicas globais (controllers/services/repositories) | Isola o domínio e facilita teste e evolução por contexto. |
| PostgreSQL | MongoDB | Transações e integridade referencial são centrais no domínio. |
| Agregado da OS persistido como unidade (itens em JSON) | Tabelas filhas com joins | Preserva o limite do agregado e simplifica a consistência. |
| Valores monetários em centavos (inteiro) | Ponto flutuante | Evita erros de arredondamento. |
