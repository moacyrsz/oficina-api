# Oficina API

Sistema Integrado de Atendimento e Execução de Serviços de uma oficina mecânica. Esta é a primeira versão (MVP) do back-end, desenvolvida para o Tech Challenge da Fase 1 do curso SOAT.

- **Curso**: SOAT - Software Architecture
- **Fase**: 1
- **Grupo**: 27
- **Integrante**: Moacyr Cabral da Silva (RM 378180) - Turma 18SOAT

## Objetivo do projeto

Substituir o controle manual da oficina (anotações e planilhas) por um sistema que organiza o atendimento, do recebimento do veículo até a entrega. O foco é a gestão de ordens de serviço, clientes e peças, com orçamento automático, controle de status, controle de estoque e acompanhamento pelo cliente.

## Descrição resumida da solução

O sistema expõe uma API REST para a operação administrativa da oficina e uma consulta pública para o cliente acompanhar a ordem. O fluxo central é a Ordem de Serviço: ela nasce ao receber o veículo, passa por diagnóstico, recebe serviços e peças, gera um orçamento, aguarda a aprovação do cliente, entra em execução, é finalizada e entregue. Cada etapa é controlada por uma máquina de estados que recusa transições inválidas. A aprovação do orçamento baixa o estoque das peças na mesma transação, garantindo consistência.

## Arquitetura utilizada

Monolito em camadas, no estilo Clean Architecture, com os contextos de negócio separados por módulos. Cada módulo tem quatro camadas:

- **domain**: entidades, agregados, objetos de valor, eventos e portas de repositório. Sem dependência de framework.
- **application**: casos de uso e limites de transação.
- **infrastructure**: TypeORM, autenticação JWT e adaptadores entre contextos.
- **interface**: controllers REST, DTOs validados e Swagger.

O detalhamento está em [docs/arquitetura.md](docs/arquitetura.md).

## Tecnologias utilizadas

- Node.js e TypeScript
- NestJS 11
- TypeORM com PostgreSQL
- Autenticação JWT com Passport
- Validação com class-validator
- Documentação com Swagger (OpenAPI)
- Testes com Jest e Supertest
- Docker e docker-compose

## Pré-requisitos

- Docker e Docker Compose (caminho recomendado), ou
- Node.js 20 ou superior e um PostgreSQL acessível (execução sem Docker)

## Instruções para execução

### Opção 1: Docker Compose (recomendado)

Sobe a aplicação e o banco, roda o seed do usuário administrador e deixa a API pronta.

```bash
docker compose up --build
```

A API fica em `http://localhost:3000`. O Swagger fica em `http://localhost:3000/api/docs`.

### Opção 2: Execução local sem Docker

```bash
# 1. Instalar dependências
npm install

# 2. Configurar o ambiente
cp .env.example .env
# ajuste as credenciais do banco no .env, se necessário

# 3. Com um PostgreSQL rodando (pode ser via docker: docker compose up db)
# criar o usuario administrador
npm run seed

# 4. Subir em modo desenvolvimento
npm run start:dev
```

## Usuários e credenciais de demonstração

O seed cria um usuário administrador. As credenciais padrão (configuráveis por variáveis de ambiente) são:

- **E-mail**: `admin@oficina.com.br`
- **Senha**: `Admin@123`

### Como autenticar

1. Chame `POST /api/auth/login` com o e-mail e a senha acima.
2. Use o `accessToken` retornado no cabeçalho `Authorization: Bearer <token>` nas rotas administrativas.
3. No Swagger, use o botão **Authorize** e cole o token.

Exemplo de tour rápido pela API:

```bash
# login
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@oficina.com.br","senha":"Admin@123"}' | jq -r .accessToken)

# criar cliente (CPF valido)
curl -s -X POST http://localhost:3000/api/clientes -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"nome":"Maria Oliveira","documento":"529.982.247-25","email":"maria@email.com","telefone":"11988887777"}'
```

## Instruções para execução dos testes

```bash
# testes unitarios e de componente
npm test

# testes com relatorio de cobertura (dominios criticos)
npm run test:cov

# testes de integracao (e2e) dos fluxos principais
npm run test:e2e
```

A cobertura mínima exigida é de 80% nos domínios críticos. A suíte entrega cerca de 99% de linhas e 85% de ramos nas camadas de domínio e nos fluxos do núcleo. O escopo da medição está documentado em `jest.config.js`.

## Acesso ao Swagger

Com a aplicação no ar, a documentação interativa da API fica em:

```
http://localhost:3000/api/docs
```

## Decisão e justificativa do banco de dados

O banco escolhido foi o **PostgreSQL**, por três motivos principais: transações ACID (necessárias para aprovar o orçamento e baixar o estoque de forma atômica), integridade referencial entre os cadastros e o atendimento, e maturidade com custo zero. A justificativa completa, com as alternativas consideradas, está em [docs/arquitetura.md](docs/arquitetura.md).

## Estrutura dos principais diretórios

```
oficina-api/
├── src/
│   ├── main.ts                      # bootstrap, Swagger, pipes e filtros globais
│   ├── app.module.ts                # composicao dos modulos
│   ├── shared/                      # nucleo compartilhado
│   │   ├── domain/                  # bases de dominio, Dinheiro, excecoes
│   │   ├── application/             # porta da Unidade de Trabalho
│   │   └── infrastructure/          # config, banco, transacoes, filtro HTTP
│   ├── modules/
│   │   ├── auth/                    # autenticacao JWT
│   │   ├── clientes/                # cadastro de clientes (CPF/CNPJ)
│   │   ├── veiculos/                # cadastro de veiculos (placa)
│   │   ├── servicos/                # catalogo de servicos
│   │   ├── pecas/                   # pecas e controle de estoque
│   │   └── ordens-servico/          # nucleo: OS, orcamento, status, tempo medio
│   │       ├── domain/              # agregado, VOs, maquina de estados, eventos
│   │       ├── application/         # casos de uso e portas
│   │       ├── infrastructure/      # persistencia e adaptadores entre contextos
│   │       └── interface/           # controllers administrativo e publico
│   └── database/seeds/              # seed do usuario administrador
├── test/                            # testes de integracao (e2e)
├── docs/                            # arquitetura, DDD, seguranca e entrega
├── Dockerfile
└── docker-compose.yml
```

Cada módulo segue a mesma divisão em domain, application, infrastructure e interface.

## Documentação DDD

- Documentação versionada no repositório: [docs/ddd/](docs/ddd/)
  - [Event Storming](docs/ddd/event-storming.md)
  - [Diagramas](docs/ddd/diagramas.md)
  - [Linguagem Ubíqua](docs/ddd/linguagem-ubiqua.md)
  - [Glossário](docs/ddd/glossario.md)
  - [Relação entre documentação e código](docs/ddd/ddd-para-codigo.md)
- Documentação no Miro (link externo): «informe o link do Miro»

## Vídeo da entrega

- «informe o link do vídeo no YouTube»

## Análise de vulnerabilidades

O resultado do `npm audit` e a avaliação de risco estão em [docs/security/analise-vulnerabilidades.md](docs/security/analise-vulnerabilidades.md).

## Visão geral dos endpoints

| Método | Rota | Protegido | Descrição |
|--------|------|-----------|-----------|
| POST | `/api/auth/login` | Não | Autentica e retorna o token JWT |
| GET/POST/PUT/DELETE | `/api/clientes` | Sim | CRUD de clientes |
| GET/POST/PUT/DELETE | `/api/veiculos` | Sim | CRUD de veículos |
| GET/POST/PUT/DELETE | `/api/servicos` | Sim | CRUD de serviços |
| GET/POST/PUT/DELETE | `/api/pecas` | Sim | CRUD de peças |
| POST | `/api/pecas/:id/estoque/repor` | Sim | Reposição de estoque |
| POST | `/api/ordens-servico` | Sim | Cria uma ordem de serviço |
| GET | `/api/ordens-servico` | Sim | Lista ordens (filtro por status) |
| GET | `/api/ordens-servico/:id` | Sim | Detalha uma ordem |
| GET | `/api/ordens-servico/metricas/tempo-medio` | Sim | Tempo médio de execução |
| POST | `/api/ordens-servico/:id/diagnostico` | Sim | Inicia o diagnóstico |
| POST | `/api/ordens-servico/:id/itens-servico` | Sim | Inclui um serviço |
| POST | `/api/ordens-servico/:id/itens-peca` | Sim | Inclui uma peça |
| POST | `/api/ordens-servico/:id/orcamento/enviar` | Sim | Gera e envia o orçamento |
| POST | `/api/ordens-servico/:id/orcamento/aprovar` | Sim | Aprova e inicia a execução |
| POST | `/api/ordens-servico/:id/orcamento/rejeitar` | Sim | Rejeita o orçamento |
| POST | `/api/ordens-servico/:id/finalizar` | Sim | Finaliza a ordem |
| POST | `/api/ordens-servico/:id/entregar` | Sim | Registra a entrega |
| GET | `/api/acompanhamento/:codigo?documento=` | Não | Consulta pública do andamento |

## Licença

Uso acadêmico, no contexto do Tech Challenge SOAT.
