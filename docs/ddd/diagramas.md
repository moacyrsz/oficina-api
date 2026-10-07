# Diagramas

Versão exportada em [diagramas.pdf](diagramas.pdf). Imagens individuais em [imagens/](imagens/).

## Mapa de Contextos

Relação entre os bounded contexts. O contexto de Atendimento (Ordem de Serviço) é o núcleo e consome os demais por meio de portas (interfaces) definidas na sua camada de aplicação, implementadas por adaptadores que delegam aos repositórios dos outros contextos.

```mermaid
flowchart TD
    subgraph Core[Atendimento - Ordem de Servico]
        OS{{Ordem de Servico}}
    end
    subgraph Cadastro
        CLI{{Cliente}}
        VEI{{Veiculo}}
    end
    subgraph Catalogo[Catalogo e Estoque]
        SER{{Servico}}
        PEC{{Peca}}
    end
    subgraph Identidade[Identidade e Acesso]
        USR{{Usuario}}
    end

    OS -->|ConsultaDeCliente| CLI
    OS -->|ConsultaDeVeiculo| VEI
    OS -->|CatalogoDeServicos| SER
    OS -->|GestaoDeEstoque| PEC
    VEI -->|valida existencia| CLI
    Identidade -->|protege as APIs administrativas| Core
    Identidade -.->|protege| Cadastro
    Identidade -.->|protege| Catalogo
```

As portas do núcleo estão em `modules/ordens-servico/application/ports/` e os adaptadores em `modules/ordens-servico/infrastructure/*.adapter.ts`.

## Diagrama do agregado Ordem de Serviço

```mermaid
classDiagram
    class OrdemDeServico {
        +string id
        +string codigo
        +string clienteId
        +string veiculoId
        +StatusOrdemServico status
        +criar(clienteId, veiculoId)
        +iniciarDiagnostico()
        +adicionarServico(ItemServico)
        +adicionarPeca(ItemPeca)
        +enviarParaAprovacao()
        +aprovarOrcamento()
        +rejeitarOrcamento(motivo)
        +finalizar()
        +entregar()
        +calcularOrcamento() Orcamento
    }
    class ItemServico {
        +string servicoId
        +Dinheiro valorUnitario
        +number quantidade
        +subtotal() Dinheiro
    }
    class ItemPeca {
        +string pecaId
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

    OrdemDeServico "1" *-- "muitos" ItemServico
    OrdemDeServico "1" *-- "muitos" ItemPeca
    OrdemDeServico "1" o-- "0..1" Aprovacao
    OrdemDeServico ..> Orcamento : calcula
    OrdemDeServico ..> StatusOrdemServico
    ItemServico ..> Dinheiro
    ItemPeca ..> Dinheiro
```

A raiz do agregado é `OrdemDeServico`. `ItemServico` e `ItemPeca` são entidades internas, acessadas apenas pela raiz. `Orcamento`, `Aprovacao`, `StatusOrdemServico` e `Dinheiro` são objetos de valor.

## Máquina de estados da Ordem de Serviço

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
```

Qualquer transição fora dessas setas é recusada pelo agregado com um erro de regra de negócio. A implementação está em `status-ordem-servico.ts` (tabela de transições) e no método privado `transicionarPara` de `ordem-de-servico.ts`.
