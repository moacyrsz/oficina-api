# Diagramas

Versão exportada em [diagramas.pdf](diagramas.pdf). Imagens individuais em [imagens/](imagens/). A visão de arquitetura (modelo C4, implantação, sequências e modelo de dados) está em [../arquitetura/](../arquitetura/c4.md).

## Mapa de Contextos

Relação entre os bounded contexts e a classificação dos subdomínios. O contexto de Atendimento (Ordem de Serviço) é o núcleo do negócio e consome os demais por meio de portas (interfaces) definidas na sua camada de aplicação. Os adaptadores que implementam essas portas traduzem os modelos dos outros contextos para o modelo do núcleo, funcionando como camada anticorrupção.

<!-- diagrama: diagrama-mapa-contextos -->
```mermaid
flowchart LR
    subgraph cadastro["Cadastro  «subdomínio de suporte»"]
        CLI{{"Cliente"}}
        VEI{{"Veículo"}}
    end
    subgraph catalogo["Catálogo e Estoque  «subdomínio de suporte»"]
        SER{{"Serviço"}}
        PEC{{"Peça"}}
    end
    subgraph core["Atendimento: Ordem de Serviço  «subdomínio principal»"]
        ACL[["Camada anticorrupção<br/>ConsultaDeCliente, ConsultaDeVeiculo,<br/>CatalogoDeServicos, GestaoDeEstoque"]]
        OS{{"Ordem de Serviço"}}
    end
    subgraph identidade["Identidade e Acesso  «subdomínio genérico»"]
        USR{{"Usuário"}}
    end
    SK["<b>Shared Kernel</b>  (src/shared)<br/>Dinheiro, Entidade, RaizDeAgregado,<br/>ObjetoDeValor, EventoDeDominio,<br/>exceções e Unidade de Trabalho"]

    VEI -- "pertence a" --> CLI
    CLI -- "U → D  Cliente-Fornecedor" --> ACL
    VEI -- "U → D  Cliente-Fornecedor" --> ACL
    SER -- "U → D  Cliente-Fornecedor" --> ACL
    PEC -- "U → D  Cliente-Fornecedor<br/>baixa de estoque na mesma transação" --> ACL
    ACL -- "traduz para ClienteConsultado,<br/>VeiculoConsultado, ServicoDoCatalogo<br/>e PecaDoEstoque" --> OS
    USR -- "U → D  Conformista<br/>JwtAuthGuard protege as APIs<br/>administrativas de todos os contextos" --> OS
    SK -. "compartilhado por<br/>todos os contextos" .- OS

    classDef agregado fill:#FFE082,stroke:#C79A00,color:#3A2E00
    classDef acl fill:#FFF9DB,stroke:#F08C00,color:#3A2E00
    classDef kernel fill:#F3F0FF,stroke:#7048E8,color:#2B1A66
    class CLI,VEI,SER,PEC,OS,USR agregado
    class ACL acl
    class SK kernel
    style core fill:#FFF4E6,stroke:#E8590C,stroke-width:2px,color:#7A2E00
    style cadastro fill:#E7F5FF,stroke:#1C7ED6,color:#0B3A66
    style catalogo fill:#E7F5FF,stroke:#1C7ED6,color:#0B3A66
    style identidade fill:#F1F3F5,stroke:#868E96,color:#343A40
```

Leitura dos padrões (U = upstream, quem fornece; D = downstream, quem consome):

| Relação | Padrão | Onde está no código |
|---------|--------|---------------------|
| Cadastro → Atendimento | Cliente-Fornecedor, com camada anticorrupção no downstream | `ordens-servico/application/ports/consulta-de-cliente.ts`, `consulta-de-veiculo.ts` e os adaptadores em `ordens-servico/infrastructure/` |
| Catálogo e Estoque → Atendimento | Cliente-Fornecedor, com camada anticorrupção no downstream | `ports/catalogo-de-servicos.ts`, `ports/gestao-de-estoque.ts`, `gestao-de-estoque.adapter.ts` |
| Identidade e Acesso → demais contextos | Conformista: os controllers usam o guard de autenticação como ele é | `auth/infrastructure/jwt-auth.guard.ts` |
| Todos os contextos | Shared Kernel: bases de domínio e transação compartilhadas | `src/shared/` |

Classificação dos subdomínios:

- **Principal (core)**: Atendimento. É o que diferencia a oficina: ciclo de vida da OS, orçamento, aprovação e acompanhamento.
- **Suporte**: Cadastro (clientes e veículos) e Catálogo e Estoque (serviços e peças). Necessários ao núcleo, mas sem regra de negócio diferenciadora.
- **Genérico**: Identidade e Acesso. Problema comum a qualquer sistema, resolvido com JWT e bcrypt.

## Modelo de domínio

Agregados, entidades e objetos de valor de todos os contextos. Agregados diferentes se referenciam apenas pelo identificador (linhas pontilhadas), nunca por referência direta de objeto. Os itens da OS guardam uma cópia do preço no momento da inclusão.

<!-- diagrama: diagrama-modelo-dominio -->
```mermaid
classDiagram
    direction LR
    class OrdemDeServico {
        <<Agregado>>
        codigo
        clienteId
        veiculoId
        status
        historico
    }
    class ItemServico {
        <<Entidade>>
        servicoId
        descricao
        valorUnitario
        quantidade
    }
    class ItemPeca {
        <<Entidade>>
        pecaId
        descricao
        valorUnitario
        quantidade
    }
    class Orcamento {
        <<Objeto de valor>>
        valorServicos
        valorPecas
        valorTotal
    }
    class Aprovacao {
        <<Objeto de valor>>
        decisao
        registradoEm
        motivo
    }
    class StatusOrdemServico {
        <<Objeto de valor>>
        RECEBIDA ... ENTREGUE
    }
    class Cliente {
        <<Agregado>>
        nome
        email
        telefone
    }
    class Documento {
        <<Objeto de valor>>
        valor
        tipo CPF ou CNPJ
    }
    class Veiculo {
        <<Agregado>>
        marca
        modelo
        ano
        clienteId
    }
    class Placa {
        <<Objeto de valor>>
        valor
    }
    class Servico {
        <<Agregado>>
        nome
        descricao
    }
    class Peca {
        <<Agregado>>
        nome
        descricao
        quantidadeEmEstoque
        baixarEstoque(quantidade)
        reporEstoque(quantidade)
    }
    class Usuario {
        <<Agregado>>
        nome
        email
        senhaHash
    }
    class Dinheiro {
        <<Objeto de valor>>
        centavos
    }

    OrdemDeServico "1" *-- "0..*" ItemServico
    OrdemDeServico "1" *-- "0..*" ItemPeca
    OrdemDeServico "1" o-- "0..1" Aprovacao
    OrdemDeServico --> StatusOrdemServico
    OrdemDeServico ..> Orcamento : calcula
    Cliente *-- Documento
    Veiculo *-- Placa
    Servico *-- Dinheiro : valor
    Peca *-- Dinheiro : precoUnitario
    ItemServico *-- Dinheiro
    ItemPeca *-- Dinheiro
    Orcamento *-- Dinheiro
    OrdemDeServico ..> Cliente : clienteId
    OrdemDeServico ..> Veiculo : veiculoId
    Veiculo ..> Cliente : clienteId
    ItemServico ..> Servico : servicoId
    ItemPeca ..> Peca : pecaId

    style OrdemDeServico fill:#FFD95A,stroke:#C79A00
    style Cliente fill:#FFD95A,stroke:#C79A00
    style Veiculo fill:#FFD95A,stroke:#C79A00
    style Servico fill:#FFD95A,stroke:#C79A00
    style Peca fill:#FFD95A,stroke:#C79A00
    style Usuario fill:#FFD95A,stroke:#C79A00
    style ItemServico fill:#FFF3BF,stroke:#C79A00
    style ItemPeca fill:#FFF3BF,stroke:#C79A00
    style Orcamento fill:#D0EBFF,stroke:#1C7ED6
    style Aprovacao fill:#D0EBFF,stroke:#1C7ED6
    style StatusOrdemServico fill:#D0EBFF,stroke:#1C7ED6
    style Documento fill:#D0EBFF,stroke:#1C7ED6
    style Placa fill:#D0EBFF,stroke:#1C7ED6
    style Dinheiro fill:#D0EBFF,stroke:#1C7ED6
```

Cores: amarelo para agregados, amarelo claro para entidades internas e azul claro para objetos de valor.

## Blocos táticos do núcleo compartilhado

Classes base de DDD em `src/shared/domain/` e como os elementos do domínio as estendem. As exceções de domínio não conhecem HTTP: o filtro global as traduz para o código de status indicado.

<!-- diagrama: diagrama-blocos-taticos -->
```mermaid
classDiagram
    direction TB
    class Entidade~T~ {
        <<abstract>>
        +id
        +igualA(outra) boolean
    }
    class RaizDeAgregado~T~ {
        <<abstract>>
        +eventos
        #registrarEvento(evento)
        +limparEventos()
    }
    class ObjetoDeValor~T~ {
        <<abstract>>
        #props imutáveis
        +igualA(outro) boolean
    }
    class EventoDeDominio {
        <<interface>>
        +nome
        +idDoAgregado
        +ocorridoEm
    }
    class ExcecaoDeDominio {
        <<abstract>>
    }

    Entidade <|-- RaizDeAgregado
    RaizDeAgregado <|-- Agregados
    Entidade <|-- EntidadesInternas
    ObjetoDeValor <|-- ObjetosDeValor
    EventoDeDominio <|.. EventosDeDominio
    RaizDeAgregado o-- EventoDeDominio : acumula
    ExcecaoDeDominio <|-- ExcecoesDeNegocio

    class Agregados {
        OrdemDeServico
        Cliente
        Veiculo
        Servico
        Peca
        Usuario
    }
    class EntidadesInternas {
        ItemServico
        ItemPeca
    }
    class ObjetosDeValor {
        Dinheiro
        Documento
        Placa
        Orcamento
        Aprovacao
    }
    class EventosDeDominio {
        ClienteCadastrado
        OrdemDeServicoCriada
        DiagnosticoIniciado
        ItemServicoAdicionado
        ItemPecaAdicionado
        OrcamentoEnviadoParaAprovacao
        OrcamentoAprovado
        OrcamentoRejeitado
        OrdemFinalizada
        VeiculoEntregue
    }
    class ExcecoesDeNegocio {
        ErroDeValidacao 400
        FalhaDeAutenticacao 401
        RecursoNaoEncontrado 404
        ConflitoDeRecurso 409
        RegraDeNegocioViolada 422
    }
```

## Diagrama do agregado Ordem de Serviço

<!-- diagrama: diagrama-agregado-os -->
```mermaid
classDiagram
    class OrdemDeServico {
        +string id
        +string codigo
        +string clienteId
        +string veiculoId
        +StatusOrdemServico status
        +RegistroDeStatus[] historico
        +Date criadaEm
        +Date iniciadaExecucaoEm
        +Date finalizadaEm
        +Date entregueEm
        +criar(clienteId, veiculoId)$ OrdemDeServico
        +iniciarDiagnostico()
        +adicionarServico(ItemServico)
        +adicionarPeca(ItemPeca)
        +enviarParaAprovacao()
        +aprovarOrcamento()
        +rejeitarOrcamento(motivo)
        +finalizar()
        +entregar()
        +calcularOrcamento() Orcamento
        +duracaoExecucaoEmMs() number
    }
    class ItemServico {
        +string servicoId
        +string descricao
        +Dinheiro valorUnitario
        +number quantidade
        +subtotal() Dinheiro
    }
    class ItemPeca {
        +string pecaId
        +string descricao
        +Dinheiro valorUnitario
        +number quantidade
        +subtotal() Dinheiro
    }
    class Orcamento {
        +Dinheiro valorServicos
        +Dinheiro valorPecas
        +valorTotal() Dinheiro
    }
    class Aprovacao {
        +DecisaoOrcamento decisao
        +Date registradoEm
        +string motivo
        +aprovado() boolean
    }
    class Dinheiro {
        +number centavos
        +reais() number
        +somar(Dinheiro) Dinheiro
        +multiplicarPor(quantidade) Dinheiro
    }
    class StatusOrdemServico {
        <<enumeration>>
        RECEBIDA
        EM_DIAGNOSTICO
        AGUARDANDO_APROVACAO
        EM_EXECUCAO
        FINALIZADA
        ENTREGUE
    }
    class DecisaoOrcamento {
        <<enumeration>>
        APROVADO
        REJEITADO
    }

    OrdemDeServico "1" *-- "muitos" ItemServico
    OrdemDeServico "1" *-- "muitos" ItemPeca
    OrdemDeServico "1" o-- "0..1" Aprovacao
    OrdemDeServico ..> Orcamento : calcula
    OrdemDeServico ..> StatusOrdemServico
    Aprovacao ..> DecisaoOrcamento
    ItemServico ..> Dinheiro
    ItemPeca ..> Dinheiro
    Orcamento ..> Dinheiro
```

A raiz do agregado é `OrdemDeServico`. `ItemServico` e `ItemPeca` são entidades internas, acessadas apenas pela raiz. `Orcamento`, `Aprovacao`, `StatusOrdemServico` e `Dinheiro` são objetos de valor. A raiz registra um evento de domínio a cada operação (ver [event-storming.md](event-storming.md)).

## Máquina de estados da Ordem de Serviço

<!-- diagrama: diagrama-maquina-estados -->
```mermaid
stateDiagram-v2
    [*] --> RECEBIDA: criar
    RECEBIDA --> EM_DIAGNOSTICO: iniciarDiagnostico
    EM_DIAGNOSTICO --> AGUARDANDO_APROVACAO: enviarParaAprovacao
    AGUARDANDO_APROVACAO --> EM_EXECUCAO: aprovarOrcamento
    AGUARDANDO_APROVACAO --> EM_DIAGNOSTICO: rejeitarOrcamento
    EM_EXECUCAO --> FINALIZADA: finalizar
    FINALIZADA --> ENTREGUE: entregar
    ENTREGUE --> [*]

    note right of EM_DIAGNOSTICO
        Itens de serviço e de peça podem ser
        incluídos em RECEBIDA e EM_DIAGNOSTICO.
        O envio exige ao menos um item.
    end note
    note right of EM_EXECUCAO
        A aprovação baixa o estoque das peças
        na mesma transação e registra o início
        da execução. Estoque insuficiente desfaz tudo.
    end note
```

Qualquer transição fora dessas setas é recusada pelo agregado com um erro de regra de negócio (HTTP 422). A implementação está em `status-ordem-servico.ts` (tabela de transições) e no método privado `transicionarPara` de `ordem-de-servico.ts`.
