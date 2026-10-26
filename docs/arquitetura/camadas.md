# Organização do monólito em camadas

O monólito é dividido em módulos por contexto de negócio (`auth`, `clientes`, `veiculos`, `servicos`, `pecas` e `ordens-servico`), mais o núcleo compartilhado (`shared`). Dentro de cada módulo, o código segue as mesmas quatro camadas, no estilo Clean Architecture (portas e adaptadores).

## Regra de dependência

As dependências apontam sempre para dentro, em direção ao domínio. O domínio não importa NestJS, TypeORM nem qualquer outra biblioteca de infraestrutura. A infraestrutura depende das camadas internas porque implementa as portas que elas declaram, e não o contrário.

<!-- diagrama: camadas-regra-de-dependencia -->
```mermaid
flowchart TB
    subgraph modulo["Módulo de negócio (mesma estrutura em todos os módulos)"]
        interface["<b>interface</b><br/><br/>Controllers REST, DTOs validados com<br/>class-validator e decorators do Swagger.<br/>Aplica o JwtAuthGuard nas rotas administrativas."]
        application["<b>application</b><br/><br/>Casos de uso, portas de saída e limites<br/>de transação (Unidade de Trabalho).<br/>Orquestra o domínio, sem regra de negócio própria."]
        domain["<b>domain</b><br/><br/>Agregados, entidades, objetos de valor,<br/>eventos, portas de repositório e exceções.<br/><i>Sem dependência de framework.</i>"]
        infrastructure["<b>infrastructure</b><br/><br/>Repositórios TypeORM, mappers, entidades ORM,<br/>adaptadores entre contextos, JWT e bcrypt."]
    end

    shared["<b>shared</b>  (núcleo compartilhado)<br/><br/>Bases de domínio (Entidade, RaizDeAgregado, ObjetoDeValor),<br/>Dinheiro, exceções, porta e implementação da Unidade de Trabalho,<br/>filtro global de exceções e configuração"]

    interface -- "chama" --> application
    interface -. "usa tipos e objetos de valor<br/>(ex.: Placa, StatusOrdemServico)" .-> domain
    application -- "orquestra" --> domain
    infrastructure -- "implementa as portas<br/>de saída" --> application
    infrastructure -- "implementa os repositórios<br/>e mapeia os agregados" --> domain
    domain -- "estende as bases<br/>de domínio" --> shared

    classDef camadaExterna fill:#DCEBFA,stroke:#5D82A8,color:#0B2540
    classDef camadaAplicacao fill:#85BBF0,stroke:#5D82A8,color:#0B2540
    classDef camadaDominio fill:#1168BD,stroke:#0B4884,color:#ffffff
    classDef nucleo fill:#F3F0FF,stroke:#7048E8,color:#2B1A66
    class interface,infrastructure camadaExterna
    class application camadaAplicacao
    class domain camadaDominio
    class shared nucleo
    style modulo fill:#ffffff,stroke:#5A5A5A,stroke-dasharray:6 4,color:#333333
```

## Correspondência com as pastas

| Camada | Pasta (exemplo do núcleo) | Exemplos |
|--------|---------------------------|----------|
| interface | `src/modules/ordens-servico/interface/` | `ordens-servico.controller.ts`, `consulta-publica.controller.ts`, `dto/` |
| application | `src/modules/ordens-servico/application/` | `aprovar-orcamento.use-case.ts`, `ports/gestao-de-estoque.ts` |
| domain | `src/modules/ordens-servico/domain/` | `ordem-de-servico.ts`, `status-ordem-servico.ts`, `orcamento.ts` |
| infrastructure | `src/modules/ordens-servico/infrastructure/` | `ordem-de-servico.repository.typeorm.ts`, `gestao-de-estoque.adapter.ts` |
| shared | `src/shared/` | `domain/dinheiro.ts`, `infrastructure/database/unidade-de-trabalho.typeorm.ts` |

## Como uma requisição atravessa as camadas

1. O `ValidationPipe` global valida o DTO. Campos inesperados são rejeitados (`whitelist` e `forbidNonWhitelisted`).
2. Nas rotas administrativas, o `JwtAuthGuard` exige um token JWT válido.
3. O controller chama o caso de uso, que abre a transação pela Unidade de Trabalho quando altera estado.
4. O caso de uso carrega o agregado pelo repositório (nos comandos, com bloqueio de linha) e delega a regra de negócio ao domínio, por exemplo a transição de status.
5. Exceções de domínio (`ErroDeValidacao`, `RecursoNaoEncontrado`, `ConflitoDeRecurso`, `RegraDeNegocioViolada`, `FalhaDeAutenticacao`) são traduzidas pelo `FiltroDeExcecoes` para 400, 404, 409, 422 e 401.
