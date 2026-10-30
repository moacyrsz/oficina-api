# Arquitetura

## Visão geral

O sistema é um back-end monolítico organizado em camadas, construído com NestJS e TypeScript. A escolha pelo monolito segue a orientação do desafio para um MVP: um único artefato, simples de executar e de operar, com os contextos de negócio separados internamente por módulos.

Cada módulo representa um contexto e é dividido em quatro camadas, no estilo Clean Architecture (ports and adapters):

- **domain**: entidades, agregados, objetos de valor, eventos e as portas de repositório. Não depende de framework nem de banco.
- **application**: casos de uso que orquestram o domínio e definem os limites de transação.
- **infrastructure**: implementações concretas (TypeORM, autenticação JWT, adaptadores entre contextos).
- **interface**: controllers REST, DTOs validados e documentação Swagger.

A regra de dependência aponta sempre para dentro: interface e infrastructure dependem de application e domain; o domínio não conhece as camadas externas. Essa separação mantém as regras de negócio isoladas e é o que torna possível testá-las sem subir banco ou servidor, sustentando a cobertura exigida nos domínios críticos.

## Diagramas de arquitetura

Todos os diagramas estão em [arquitetura/](arquitetura/), escritos em Mermaid (renderizados pelo GitHub), exportados como imagem em [arquitetura/imagens/](arquitetura/imagens/) e consolidados em [diagramas-arquitetura.pdf](arquitetura/diagramas-arquitetura.pdf).

| Diagrama | O que mostra |
|----------|--------------|
| [C4 nível 1: contexto](arquitetura/c4.md#nível-1-diagrama-de-contexto-do-sistema) | Quem usa o sistema e para quê |
| [C4 nível 2: contêineres](arquitetura/c4.md#nível-2-diagrama-de-contêineres) | API NestJS, seed do administrador e PostgreSQL |
| [C4 nível 3: componentes](arquitetura/c4.md#nível-3-diagrama-de-componentes) | Módulos por contexto e portas e adaptadores do núcleo |
| [Implantação](arquitetura/c4.md#diagrama-de-implantação) | Contêineres do docker-compose, portas e volume |
| [Camadas](arquitetura/camadas.md) | Regra de dependência dentro de cada módulo |
| [Sequências](arquitetura/sequencias.md) | Autenticação, abertura da OS, aprovação transacional, finalização e consulta pública |
| [Modelo de dados](arquitetura/modelo-de-dados.md) | Tabelas, colunas JSON do agregado e decisões de persistência |

Os diagramas de DDD (Event Storming, mapa de contextos, modelo de domínio e máquina de estados) estão em [ddd/](ddd/).

O bloco Mermaid de cada diagrama é a fonte oficial. Depois de editá-lo, regenere a imagem correspondente colando o bloco em [mermaid.live](https://mermaid.live) ou com o Mermaid CLI (`npx -p @mermaid-js/mermaid-cli mmdc -i diagrama.mmd -o diagrama.png`).

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

O núcleo de Ordens de Serviço não acessa diretamente o modelo dos outros contextos. Ele declara portas na camada de aplicação (`CatalogoDeServicos`, `GestaoDeEstoque`, `ConsultaDeCliente`, `ConsultaDeVeiculo`) e recebe adaptadores que traduzem essas portas para os repositórios dos contextos de catálogo e cadastro. Isso reduz o acoplamento e deixa explícito o que o núcleo precisa de cada contexto. Os adaptadores também validam o CPF/CNPJ e a placa com os objetos de valor do contexto de origem antes de buscar o cliente e o veículo na abertura da OS.

No sentido contrário, os cadastros precisam saber se um cliente ou veículo já tem histórico antes de removê-lo. Para isso, Clientes e Veículos declaram as portas `VinculosDoCliente` e `VinculosDoVeiculo`, implementadas por consultas de leitura nas tabelas `veiculos` e `ordens_servico`. As consultas usam os nomes das tabelas, e não as entidades dos outros módulos, para não criar dependência circular entre os módulos que já dependem dos cadastros.

## Decisão e justificativa do banco de dados

O banco escolhido foi o **PostgreSQL**.

Motivos:

- **Transações ACID**: o fluxo de aprovação do orçamento altera a Ordem de Serviço e baixa o estoque das peças em uma única operação. Esses dois efeitos precisam acontecer juntos ou nenhum deles. Um banco relacional transacional atende isso de forma direta e confiável.
- **Bloqueio de linha**: `SELECT ... FOR UPDATE` serializa operações simultâneas sobre a mesma ordem ou a mesma peça. É o que impede que duas aprovações da mesma OS baixem o estoque duas vezes ou que duas reposições se sobrescrevam.
- **Unicidade garantida pelo banco**: índices únicos protegem documento do cliente, placa do veículo, e-mail do usuário e código da OS, mesmo se duas requisições tentarem criar o mesmo registro ao mesmo tempo.
- **Dados estruturados e estáveis**: o domínio da oficina é tabular e tem baixo índice de mudança de esquema. Não há necessidade de um banco de documentos.
- **Maturidade e custo**: PostgreSQL é gratuito, maduro, amplamente suportado e roda sem fricção em contêiner.

Os agregados se referenciam por identificador, sem chave estrangeira física entre eles, como recomenda o DDD. As regras de vínculo ficam na aplicação: a criação exige que o cliente e o veículo existam e que o veículo pertença ao cliente, e a remoção é recusada quando o cliente ou o veículo já tem histórico.

O acesso ao banco usa TypeORM. O schema é versionado em migrations (`src/database/migrations`), aplicadas automaticamente na subida da aplicação (`DB_MIGRATIONS_RUN=true`), e a sincronização automática do TypeORM fica desligada. Os testes de integração rodam por padrão em um banco relacional em memória (sql.js), que exercita o mesmo mapeamento e as mesmas transações sem servidor externo. Com `npm run test:e2e:pg`, os mesmos testes rodam no PostgreSQL real, sobre o schema criado pelas migrations, junto com os testes de concorrência e de migrations.

## Tratamento de transações

As transações são tratadas por uma Unidade de Trabalho (padrão Unit of Work):

- A porta `UnidadeDeTrabalho` expõe um método `executar(operacao)`.
- A implementação sobre TypeORM abre uma transação e publica o `EntityManager` transacional em um `ContextoDeTransacao` baseado em `AsyncLocalStorage`.
- Os repositórios leem esse contexto e, quando há transação ativa, usam o manager dela. Com isso participam automaticamente da mesma transação, sem precisar receber o manager em cada chamada.

Os casos de uso que alteram estado rodam dentro de `unidadeDeTrabalho.executar(...)`. Qualquer exceção provoca rollback. O exemplo mais relevante é a aprovação do orçamento: se o estoque for insuficiente, a baixa falha, a transação é desfeita e a ordem permanece em Aguardando aprovação. Esse comportamento é verificado no teste de integração.

### Concorrência

Uma transação sozinha não impede que duas requisições leiam o mesmo dado ao mesmo tempo e uma sobrescreva a outra. Por isso:

- Todo comando sobre uma OS (diagnóstico, inclusão de itens, envio, aprovação, rejeição, finalização e entrega) lê a ordem com `buscarPorIdParaAtualizar`, que aplica `SELECT ... FOR UPDATE`. Comandos simultâneos na mesma OS rodam um de cada vez.
- Toda movimentação de estoque (baixa na aprovação, reposição e atualização cadastral da peça) lê a peça com `buscarParaAtualizar`, também com bloqueio.
- Na aprovação, as peças são bloqueadas sempre em ordem de identificador, para que duas aprovações com peças em comum nunca fiquem esperando uma pela outra (deadlock).

Os testes em `test/concorrencia.e2e-spec.ts` reproduzem as disputas no PostgreSQL real: uma conexão externa trava a linha, várias requisições simultâneas ficam esperando e, ao liberar, o teste confere que só uma aprovação baixa o estoque, que nenhum item incluído se perde e que todas as reposições são somadas. Sem os bloqueios, os três testes falham por perda de atualização.

## Segurança

- Autenticação JWT nas APIs administrativas, via Passport. O token é emitido no login e exigido por um guard nas rotas internas.
- Senhas armazenadas apenas como hash (bcrypt).
- Validação de entrada em duas frentes: DTOs com class-validator na borda HTTP e objetos de valor no domínio (CPF, CNPJ e placa validam a si mesmos).
- Cabeçalhos de segurança HTTP com Helmet.
- As rotas públicas do cliente (consulta do andamento e decisão sobre o orçamento) exigem o código da ordem e o documento do cliente correspondente. Ordem inexistente e documento incorreto recebem a mesma resposta, o que impede descobrir códigos válidos por tentativa.

## Decisões registradas

| Decisão | Alternativa considerada | Motivo da escolha |
|---------|-------------------------|-------------------|
| Monolito em camadas | Microsserviços | É um MVP. Monolito reduz complexidade operacional. |
| Clean Architecture por módulo | Camadas técnicas globais (controllers/services/repositories) | Isola o domínio e facilita teste e evolução por contexto. |
| PostgreSQL | MongoDB | Transações e bloqueio de linha são centrais no domínio. |
| Agregado da OS persistido como unidade (itens em JSON) | Tabelas filhas com joins | Preserva o limite do agregado e simplifica a consistência. |
| Valores monetários em centavos (inteiro) | Ponto flutuante | Evita erros de arredondamento. |
| Bloqueio pessimista (`FOR UPDATE`) | Bloqueio otimista por versão | As disputas são curtas e pontuais; serializar é mais simples e não exige repetir a operação. |
| Referência entre agregados por identificador, com regras de vínculo na aplicação | Chaves estrangeiras entre tabelas de contextos diferentes | Mantém os agregados independentes e deixa a regra explícita e testável no caso de uso. |
| Migrations versionadas, aplicadas na subida | `synchronize` do TypeORM | O schema fica rastreável e reproduzível, e nada é alterado no banco sem uma migration revisada. |
| Cliente decide o orçamento na API pública, com código da OS e documento | Decisão apenas pela equipe | Atende o acompanhamento e a autorização pelo próprio cliente, sem criar contas de usuário para clientes. |
