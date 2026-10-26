# Event Storming

Este documento registra o Event Storming da solução. Os três fluxos pedidos no desafio estão modelados: criação da Ordem de Serviço, acompanhamento da Ordem de Serviço e gestão de peças e insumos. Antes deles há a visão geral da linha do tempo (big picture) e, ao final, a consolidação dos atores, comandos, eventos, políticas, agregados, entidades e objetos de valor.

Os diagramas usam Mermaid, são renderizados diretamente no GitHub e seguem as cores convencionais dos post-its do Event Storming. A versão exportada está em [event-storming.pdf](event-storming.pdf) e as imagens individuais em [imagens/](imagens/).

## Legenda dos elementos

| Cor | Elemento | Representa |
|-----|----------|-----------|
| Laranja | Evento de domínio | Fato de negócio que já ocorreu (nomeado no passado). |
| Azul | Comando | Intenção de alterar o sistema (o que um ator pede). |
| Amarelo claro | Ator | Quem inicia o comando. |
| Amarelo | Agregado | Objeto que recebe o comando e garante as invariantes. |
| Lilás | Política | Regra reativa: quando um evento acontece, dispara outra ação. |
| Verde | Read model | Informação consultada para apoiar uma decisão. |
| Bege tracejado | Regra de negócio | Invariante verificada pelo agregado. |
| Vermelho | Hotspot | Ponto de dúvida ou risco levantado durante a modelagem. |

A gramática que liga os elementos é a mesma em todos os fluxos:

<!-- diagrama: event-storming-0-legenda -->
```mermaid
flowchart LR
    rm["Read model"]:::leitura -. "informa" .-> ator(["Ator"]):::ator
    ator -- "executa" --> cmd["Comando"]:::comando
    cmd -- "sobre" --> ag{{"Agregado"}}:::agregado
    ag -- "emite" --> ev["Evento de domínio"]:::evento
    ev -- "dispara" --> pol["Política"]:::politica
    pol -- "gera novo" --> cmd2["Comando"]:::comando
    ag -.- regra["Regra de negócio"]:::regra
    ev -.- hs["Hotspot"]:::hotspot

    classDef ator fill:#FFF7B3,stroke:#B8A600,color:#3A3300
    classDef comando fill:#8EC5FC,stroke:#1E6FB8,color:#0B2540
    classDef agregado fill:#FFD95A,stroke:#C79A00,color:#3A2E00
    classDef evento fill:#FFA94D,stroke:#D9480F,color:#3A1600
    classDef politica fill:#D0A9F5,stroke:#7B2CBF,color:#2A0A40
    classDef leitura fill:#B2F2BB,stroke:#2B8A3E,color:#0B2A12
    classDef regra fill:#FFF8E7,stroke:#A68A00,color:#3A3300,stroke-dasharray:4 3
    classDef hotspot fill:#FF8787,stroke:#C92A2A,color:#3A0000
```

## Etapas aplicadas na modelagem

A modelagem seguiu as etapas usuais do Event Storming:

1. **Eventos (exploração livre)**: levantamento dos fatos relevantes do atendimento, escritos no passado, sem preocupação com ordem.
2. **Linha do tempo**: ordenação dos eventos do recebimento do veículo até a entrega, identificando os eventos pivotais que mudam a fase do atendimento.
3. **Hotspots**: registro das dúvidas e riscos (por exemplo, o estoque acabar entre o orçamento e a aprovação).
4. **Comandos e atores**: para cada evento, quem age e qual intenção o provoca.
5. **Políticas e read models**: reações automáticas a eventos e informações necessárias para cada decisão.
6. **Agregados**: agrupamento dos comandos e eventos em torno de quem garante as invariantes.
7. **Bounded contexts**: separação das linguagens e responsabilidades em contextos, que viraram os módulos do código.

## Bounded Contexts identificados

- **Atendimento (Ordem de Serviço)**: contexto central (core). Concentra o ciclo de vida da OS, o orçamento e o acompanhamento.
- **Catálogo e Estoque**: serviços oferecidos e peças com controle de estoque (contexto de suporte).
- **Cadastro**: clientes e veículos (contexto de suporte).
- **Identidade e Acesso**: autenticação dos usuários administrativos (contexto genérico).

A relação entre os contextos está no mapa de contextos em [diagramas.md](diagramas.md).

## Visão geral: linha do tempo de eventos

Linha do tempo completa, da esquerda para a direita, com os eventos agrupados por bounded context. Eventos pivotais têm borda reforçada. Os hotspots registram as dúvidas levantadas e como foram resolvidas.

<!-- diagrama: event-storming-visao-geral -->
```mermaid
flowchart LR
    subgraph cad["Cadastro"]
        e0["ClienteCadastrado"]:::evento
    end
    subgraph est["Catálogo e Estoque"]
        p1["PecaCadastrada"]:::evento
        p2["EstoqueReposto"]:::evento
        p3["EstoqueBaixado"]:::evento
    end
    subgraph at["Atendimento: Ordem de Serviço"]
        e1["OrdemDeServicoCriada"]:::pivotal
        e2["DiagnosticoIniciado"]:::evento
        e3["ItemServicoAdicionado"]:::evento
        e4["ItemPecaAdicionado"]:::evento
        e5["OrcamentoEnviadoParaAprovacao"]:::pivotal
        e6["OrcamentoAprovado"]:::pivotal
        e6r["OrcamentoRejeitado"]:::evento
        e7["OrdemFinalizada"]:::evento
        e8["VeiculoEntregue"]:::pivotal
    end

    h1["Hotspot: o estoque pode acabar entre o<br/>orçamento e a aprovação. Resolvido com<br/>baixa atômica na aprovação e rollback"]:::hotspot
    h2["Hotspot: o cliente pode recusar o orçamento.<br/>Resolvido: a OS volta para Em diagnóstico"]:::hotspot
    h3["Hotspot: remover o cliente apagaria o<br/>histórico. Resolvido: cliente ou veículo<br/>com OS não pode ser removido"]:::hotspot
    h4["Hotspot: duas aprovações ao mesmo tempo<br/>baixariam o estoque em dobro. Resolvido:<br/>comandos na mesma OS rodam um de cada vez"]:::hotspot

    e0 --> e1 --> e2
    e2 --> e3 --> e5
    e2 --> e4 --> e5
    p1 --> p2 --> e4
    e5 --> e6 --> p3 --> e7 --> e8
    e5 --> e6r
    e6r -. "novo orçamento" .-> e2
    h1 -.- e6
    h2 -.- e6r
    h3 -.- e0
    h4 -.- p3

    classDef evento fill:#FFA94D,stroke:#D9480F,color:#3A1600
    classDef pivotal fill:#FFA94D,stroke:#7A2E00,stroke-width:4px,color:#3A1600
    classDef hotspot fill:#FF8787,stroke:#C92A2A,color:#3A0000
    style cad fill:#E7F5FF,stroke:#1C7ED6,color:#0B3A66
    style est fill:#E7F5FF,stroke:#1C7ED6,color:#0B3A66
    style at fill:#FFF4E6,stroke:#E8590C,color:#7A2E00
```

## Fluxo 1: Criação da Ordem de Serviço

<!-- diagrama: event-storming-1-criacao -->
```mermaid
flowchart TB
    subgraph s1["1. Abertura da OS"]
        direction LR
        rm1["Cliente com CPF ou CNPJ<br/>e veículo com placa"]:::leitura
        a1(["Atendente"]):::ator
        c1["Abrir ordem<br/>de serviço"]:::comando
        g1{{"Ordem de<br/>Serviço"}}:::agregado
        v1["OrdemDeServicoCriada"]:::evento
        r1["Cliente identificado pelo CPF/CNPJ e veículo<br/>pela placa; o veículo precisa pertencer ao<br/>cliente. A OS nasce no status Recebida"]:::regra
        rm1 -.-> a1 --> c1 --> g1 --> v1
        g1 -.- r1
    end
    subgraph s2["2. Diagnóstico"]
        direction LR
        a2(["Mecânico"]):::ator
        c2["Iniciar<br/>diagnóstico"]:::comando
        g2{{"Ordem de<br/>Serviço"}}:::agregado
        v2["DiagnosticoIniciado"]:::evento
        a2 --> c2 --> g2 --> v2
    end
    subgraph s3["3. Inclusão de serviços e peças"]
        direction LR
        rm2["Catálogo de serviços e peças<br/>com o preço atual"]:::leitura
        a3(["Mecânico"]):::ator
        c3["Adicionar<br/>serviço"]:::comando
        c4["Adicionar<br/>peça"]:::comando
        g3{{"Ordem de<br/>Serviço"}}:::agregado
        v3["ItemServicoAdicionado"]:::evento
        v4["ItemPecaAdicionado"]:::evento
        r3["Itens só entram em Recebida ou<br/>Em diagnóstico, com o preço congelado"]:::regra
        rm2 -.-> a3
        a3 --> c3 --> g3
        a3 --> c4 --> g3
        g3 --> v3
        g3 --> v4
        g3 -.- r3
    end
    subgraph s4["4. Envio do orçamento"]
        direction LR
        a4(["Atendente"]):::ator
        c5["Enviar<br/>orçamento"]:::comando
        g4{{"Ordem de<br/>Serviço"}}:::agregado
        v5["OrcamentoEnviadoParaAprovacao"]:::evento
        r5["Orçamento calculado pela soma dos itens,<br/>nunca digitado. Exige ao menos um item"]:::regra
        a4 --> c5 --> g4 --> v5
        g4 -.- r5
    end
    s1 ~~~ s2 ~~~ s3 ~~~ s4

    classDef ator fill:#FFF7B3,stroke:#B8A600,color:#3A3300
    classDef comando fill:#8EC5FC,stroke:#1E6FB8,color:#0B2540
    classDef agregado fill:#FFD95A,stroke:#C79A00,color:#3A2E00
    classDef evento fill:#FFA94D,stroke:#D9480F,color:#3A1600
    classDef leitura fill:#B2F2BB,stroke:#2B8A3E,color:#0B2A12
    classDef regra fill:#FFF8E7,stroke:#A68A00,color:#3A3300,stroke-dasharray:4 3
    style s1 fill:#FAFAFA,stroke:#BDBDBD,color:#424242
    style s2 fill:#FAFAFA,stroke:#BDBDBD,color:#424242
    style s3 fill:#FAFAFA,stroke:#BDBDBD,color:#424242
    style s4 fill:#FAFAFA,stroke:#BDBDBD,color:#424242
```

**Atores**: Atendente, Mecânico.
**Comandos**: Criar Ordem de Serviço, Iniciar Diagnóstico, Adicionar Serviço, Adicionar Peça, Enviar Orçamento.
**Eventos**: OrdemDeServicoCriada, DiagnosticoIniciado, ItemServicoAdicionado, ItemPecaAdicionado, OrcamentoEnviadoParaAprovacao.
**Read models**: cadastro do cliente e do veículo; catálogo de serviços e peças com o preço atual.
**Políticas / regras**:
- A OS é aberta informando o CPF/CNPJ do cliente e a placa do veículo. Os dois precisam estar cadastrados e o veículo precisa pertencer ao cliente.
- Itens só podem ser incluídos enquanto a OS está em Recebida ou Em diagnóstico.
- O preço do item é copiado do catálogo no momento da inclusão.
- O orçamento é calculado automaticamente pela soma dos itens. Não é digitado.
- O envio do orçamento exige ao menos um item.

## Fluxo 2: Acompanhamento da Ordem de Serviço

O cliente acompanha o andamento e decide sobre o orçamento pela API pública, informando o código da OS e o seu documento. Quando o cliente decide por telefone ou presencialmente, a equipe registra a mesma decisão na API administrativa.

<!-- diagrama: event-storming-2-acompanhamento -->
```mermaid
flowchart TB
    subgraph s1["1. Aprovação do orçamento"]
        direction LR
        rm1["Orçamento da OS:<br/>itens e valor total"]:::leitura
        a1(["Cliente<br/>(API pública: código<br/>da OS e CPF/CNPJ)"]):::ator
        c1["Aprovar<br/>orçamento"]:::comando
        g1{{"Ordem de<br/>Serviço"}}:::agregado
        v1["OrcamentoAprovado"]:::evento
        p1["Política: baixar o estoque<br/>das peças na mesma transação"]:::politica
        c1b["Baixar<br/>estoque"]:::comando
        g1b{{"Peça"}}:::agregado
        v1b["EstoqueBaixado"]:::evento
        r1["A OS vai para Em execução e registra o<br/>início da execução. Estoque insuficiente<br/>desfaz a aprovação inteira. Aprovações<br/>simultâneas: só a primeira vale"]:::regra
        rm1 -.-> a1 --> c1 --> g1 --> v1 --> p1 --> c1b --> g1b --> v1b
        g1 -.- r1
    end
    subgraph s2["2. Rejeição do orçamento"]
        direction LR
        a2(["Cliente<br/>(API pública: código<br/>da OS e CPF/CNPJ)"]):::ator
        c2["Rejeitar<br/>orçamento"]:::comando
        g2{{"Ordem de<br/>Serviço"}}:::agregado
        v2["OrcamentoRejeitado"]:::evento
        p2["Política: a OS volta para Em<br/>diagnóstico para um novo orçamento"]:::politica
        a2 --> c2 --> g2 --> v2 --> p2
    end
    subgraph s3["3. Execução e finalização"]
        direction LR
        a3(["Mecânico"]):::ator
        c3["Finalizar<br/>ordem"]:::comando
        g3{{"Ordem de<br/>Serviço"}}:::agregado
        v3["OrdemFinalizada"]:::evento
        rm3["Tempo médio de execução<br/>(aprovação até finalização)"]:::leitura
        a3 --> c3 --> g3 --> v3
        v3 -. "alimenta" .-> rm3
    end
    subgraph s4["4. Entrega"]
        direction LR
        a4(["Atendente"]):::ator
        c4["Entregar<br/>veículo"]:::comando
        g4{{"Ordem de<br/>Serviço"}}:::agregado
        v4["VeiculoEntregue"]:::evento
        a4 --> c4 --> g4 --> v4
    end
    subgraph s5["Acompanhamento pelo cliente (a qualquer momento)"]
        direction LR
        rm5["Andamento da OS:<br/>status, histórico e orçamento"]:::leitura
        a5(["Cliente"]):::ator
        rm5 -. "consulta pública com o<br/>código da OS e o CPF/CNPJ" .-> a5
    end
    s1 ~~~ s2 ~~~ s3 ~~~ s4 ~~~ s5

    classDef ator fill:#FFF7B3,stroke:#B8A600,color:#3A3300
    classDef comando fill:#8EC5FC,stroke:#1E6FB8,color:#0B2540
    classDef agregado fill:#FFD95A,stroke:#C79A00,color:#3A2E00
    classDef evento fill:#FFA94D,stroke:#D9480F,color:#3A1600
    classDef politica fill:#D0A9F5,stroke:#7B2CBF,color:#2A0A40
    classDef leitura fill:#B2F2BB,stroke:#2B8A3E,color:#0B2A12
    classDef regra fill:#FFF8E7,stroke:#A68A00,color:#3A3300,stroke-dasharray:4 3
    style s1 fill:#FAFAFA,stroke:#BDBDBD,color:#424242
    style s2 fill:#FAFAFA,stroke:#BDBDBD,color:#424242
    style s3 fill:#FAFAFA,stroke:#BDBDBD,color:#424242
    style s4 fill:#FAFAFA,stroke:#BDBDBD,color:#424242
    style s5 fill:#F1F8F2,stroke:#8BC79A,color:#1B4D2A
```

**Atores**: Cliente, Mecânico, Atendente.
**Comandos**: Aprovar Orçamento, Rejeitar Orçamento, Baixar Estoque (disparado pela política), Finalizar Ordem, Entregar Veículo.
**Eventos**: OrcamentoAprovado, OrcamentoRejeitado, OrdemFinalizada, VeiculoEntregue.
**Read models**: orçamento da OS; andamento da OS (consulta pública); tempo médio de execução.
**Políticas / regras**:
- A aprovação do orçamento dispara a baixa de estoque das peças, na mesma transação. Estoque insuficiente desfaz a aprovação.
- A aprovação leva a OS para Em execução e registra o início da execução.
- Comandos simultâneos na mesma OS são executados um de cada vez: se a mesma aprovação chegar duas vezes, só a primeira vale.
- A rejeição volta a OS para Em diagnóstico, permitindo um novo orçamento.
- As transições de status seguem a máquina de estados. Transições inválidas são recusadas.
- O cliente consulta o andamento informando o código da OS e o seu documento.

## Fluxo 3: Gestão de peças e insumos

<!-- diagrama: event-storming-3-gestao-pecas -->
```mermaid
flowchart TB
    subgraph s1["1. Cadastro de peça ou insumo"]
        direction LR
        a1(["Estoquista"]):::ator
        c1["Cadastrar<br/>peça"]:::comando
        g1{{"Peça"}}:::agregado
        v1["PecaCadastrada"]:::evento
        r1["Nome obrigatório e estoque<br/>inicial maior ou igual a zero"]:::regra
        a1 --> c1 --> g1 --> v1
        g1 -.- r1
    end
    subgraph s2["2. Reposição de estoque"]
        direction LR
        rm2["Saldo de estoque<br/>por peça"]:::leitura
        a2(["Estoquista"]):::ator
        c2["Repor<br/>estoque"]:::comando
        g2{{"Peça"}}:::agregado
        v2["EstoqueReposto"]:::evento
        r2["Quantidade inteira e positiva.<br/>Leitura com bloqueio: reposições<br/>simultâneas são todas somadas"]:::regra
        rm2 -.-> a2 --> c2 --> g2 --> v2
        g2 -.- r2
    end
    subgraph s3["3. Baixa na aprovação do orçamento"]
        direction LR
        ext["OrcamentoAprovado<br/>(Atendimento)"]:::evento
        p3["Política: baixar o estoque<br/>das peças do orçamento"]:::politica
        c3["Baixar<br/>estoque"]:::comando
        g3{{"Peça"}}:::agregado
        v3["EstoqueBaixado"]:::evento
        r3["Saldo nunca negativo. Leitura com<br/>bloqueio (SELECT ... FOR UPDATE)"]:::regra
        ext --> p3 --> c3 --> g3 --> v3
        g3 -.- r3
    end
    s1 ~~~ s2 ~~~ s3

    classDef ator fill:#FFF7B3,stroke:#B8A600,color:#3A3300
    classDef comando fill:#8EC5FC,stroke:#1E6FB8,color:#0B2540
    classDef agregado fill:#FFD95A,stroke:#C79A00,color:#3A2E00
    classDef evento fill:#FFA94D,stroke:#D9480F,color:#3A1600
    classDef politica fill:#D0A9F5,stroke:#7B2CBF,color:#2A0A40
    classDef leitura fill:#B2F2BB,stroke:#2B8A3E,color:#0B2A12
    classDef regra fill:#FFF8E7,stroke:#A68A00,color:#3A3300,stroke-dasharray:4 3
    style s1 fill:#FAFAFA,stroke:#BDBDBD,color:#424242
    style s2 fill:#FAFAFA,stroke:#BDBDBD,color:#424242
    style s3 fill:#FAFAFA,stroke:#BDBDBD,color:#424242
```

**Atores**: Estoquista, e o processo de aprovação da OS (como gatilho da política).
**Comandos**: Criar Peça, Repor Estoque, Baixar Estoque.
**Eventos**: PecaCadastrada, EstoqueReposto, EstoqueBaixado.
**Read models**: saldo de estoque por peça.
**Políticas / regras**:
- O saldo de estoque nunca pode ficar negativo. A baixa só ocorre se houver saldo suficiente.
- A baixa de estoque é acionada pela aprovação do orçamento e participa da transação da OS.
- Baixas e reposições simultâneas da mesma peça são executadas uma de cada vez, e nenhuma se perde.

> Observação de implementação: os eventos de domínio são registrados pela raiz do agregado (`RaizDeAgregado.registrarEvento`) e documentam os fatos do modelo, mas não são publicados para outros contextos no MVP. As políticas são executadas de forma síncrona pelos casos de uso: por exemplo, `AprovarOrcamentoUseCase` chama a porta `GestaoDeEstoque` dentro da mesma transação. Os eventos do contexto de peças (PecaCadastrada, EstoqueReposto, EstoqueBaixado) representam o modelo do Event Storming. No código, a invariante de estoque é garantida pelos métodos `baixarEstoque` e `reporEstoque` do agregado `Peca`. Os eventos de domínio foram materializados como classes no agregado `OrdemDeServico`, que é o núcleo da solução, e no agregado `Cliente` (`ClienteCadastrado`).

## Consolidação

### Atores
Atendente, Mecânico, Estoquista, Cliente, Usuário administrativo.

### Comandos
Criar Ordem de Serviço, Iniciar Diagnóstico, Adicionar Serviço, Adicionar Peça, Enviar Orçamento, Aprovar Orçamento, Rejeitar Orçamento, Finalizar Ordem, Entregar Veículo, Consultar Andamento, Criar Peça, Repor Estoque, Baixar Estoque, além dos comandos de CRUD de clientes, veículos e serviços.

### Eventos de domínio
ClienteCadastrado, OrdemDeServicoCriada, DiagnosticoIniciado, ItemServicoAdicionado, ItemPecaAdicionado, OrcamentoEnviadoParaAprovacao, OrcamentoAprovado, OrcamentoRejeitado, OrdemFinalizada, VeiculoEntregue, PecaCadastrada, EstoqueReposto, EstoqueBaixado.

### Políticas e regras de negócio
- Orçamento gerado automaticamente pela soma dos itens.
- Execução só começa após aprovação do orçamento.
- Baixa de estoque atômica na aprovação, com saldo nunca negativo.
- Máquina de estados que recusa transições inválidas.
- Identificação do cliente por CPF ou CNPJ válido e do veículo por placa válida, inclusive na abertura da OS.
- Decisão do cliente pela API pública só com o código da OS e o documento dele.
- Comandos simultâneos na mesma OS ou na mesma peça executados um de cada vez.
- Cliente ou veículo com histórico de atendimento não pode ser removido.

### Read models
Cadastro do cliente e do veículo, catálogo de serviços e peças, orçamento da OS, andamento da OS (consulta pública), saldo de estoque e tempo médio de execução.

### Agregados
Ordem de Serviço (raiz), Cliente, Veículo, Serviço, Peça, Usuário.

### Entidades
Ordem de Serviço, Item de Serviço, Item de Peça, Cliente, Veículo, Serviço, Peça, Usuário.

### Objetos de valor
Documento (CPF ou CNPJ), Placa, Dinheiro, Orçamento, Aprovação, Status da Ordem de Serviço.

A correspondência entre esses elementos e os arquivos do código está em [ddd-para-codigo.md](ddd-para-codigo.md).
