# Diagramas de sequência dos fluxos principais

Estes diagramas mostram, passo a passo, como os componentes colaboram nos fluxos exigidos pelo desafio. Eles complementam o [modelo C4](c4.md) com a visão dinâmica. Os nomes correspondem às classes do código em `src/modules/`.

## 1. Autenticação JWT e acesso a uma rota administrativa

O login devolve um token JWT. As rotas administrativas exigem esse token no cabeçalho `Authorization`. Credencial inválida sempre recebe a mesma mensagem genérica, para não revelar se o e-mail existe.

<!-- diagrama: seq-1-autenticacao -->
```mermaid
sequenceDiagram
    autonumber
    actor U as Usuário administrativo
    participant AC as AuthController
    participant UC as AutenticarUseCase
    participant R as UsuarioRepository
    participant H as HashDeSenha (bcrypt)
    participant T as ServicoDeToken (JWT)
    participant G as JwtAuthGuard e JwtStrategy
    participant C as Controller administrativo

    U->>AC: POST /api/auth/login {email, senha}
    Note over U,AC: ValidationPipe valida o LoginDto
    AC->>UC: executar(email, senha)
    UC->>R: buscarPorEmail(email em minúsculas)
    R-->>UC: Usuario ou nulo
    UC->>H: comparar(senha, senhaHash)
    H-->>UC: confere ou não confere
    alt usuário inexistente ou senha incorreta
        UC-->>U: 401 Credenciais invalidas (mensagem genérica)
    else credenciais válidas
        UC->>T: gerar(sub = id, email)
        T-->>UC: accessToken assinado com JWT_SECRET
        UC-->>U: 200 {accessToken, tipo Bearer, expiraEm}
    end

    U->>G: GET /api/clientes com Authorization Bearer
    alt token ausente, inválido ou expirado
        G-->>U: 401 Unauthorized
    else token válido
        G->>C: requisição com usuário autenticado (id, email)
        C-->>U: 200 com os dados
    end
```

## 2. Abertura da OS, inclusão de itens e envio do orçamento

Fluxo de criação da Ordem de Serviço. O cliente é identificado pelo CPF/CNPJ e o veículo pela placa. Cada item guarda o preço do catálogo no momento da inclusão. O orçamento é calculado pelo agregado, nunca digitado. O estoque ainda não é baixado nesta etapa.

<!-- diagrama: seq-2-abertura-orcamento -->
```mermaid
sequenceDiagram
    autonumber
    actor A as Atendente ou mecânico
    participant C as OrdensServicoController
    participant UC as Caso de uso
    participant P as Portas de outros contextos
    participant OS as OrdemDeServico (agregado)
    participant R as OrdemDeServicoRepository

    Note over A,R: Pré-requisito: cliente e veículo já cadastrados
    A->>C: POST /api/ordens-servico {documento, placa}
    C->>UC: CriarOrdemDeServicoUseCase
    UC->>P: ConsultaDeCliente.buscarPorDocumento e ConsultaDeVeiculo.buscarPorPlaca
    Note right of P: CPF/CNPJ e placa validados pelos<br/>objetos de valor Documento e Placa
    alt documento ou placa em formato inválido
        P-->>A: 400
    else cliente ou veículo não cadastrado
        UC-->>A: 404
    else veículo de outro cliente
        UC-->>A: 422
    else dados consistentes
        UC->>OS: OrdemDeServico.criar()
        Note right of OS: status RECEBIDA<br/>código OS-XXXXXXXX<br/>evento OrdemDeServicoCriada
        UC->>R: salvar(ordem) dentro de uma transação
        UC-->>A: 201 {id, codigo, status RECEBIDA}
    end

    A->>C: POST /api/ordens-servico/{id}/diagnostico
    C->>UC: IniciarDiagnosticoUseCase (transação)
    UC->>R: buscarPorIdParaAtualizar(id)
    Note right of R: cada comando lê a OS com<br/>SELECT ... FOR UPDATE
    UC->>OS: iniciarDiagnostico()
    Note right of OS: RECEBIDA para EM_DIAGNOSTICO
    UC-->>A: 200

    A->>C: POST /api/ordens-servico/{id}/itens-servico {servicoId, quantidade}
    C->>UC: AdicionarServicoUseCase (transação)
    UC->>P: CatalogoDeServicos.buscarServico
    P-->>UC: nome e preço atual
    UC->>OS: adicionarServico(ItemServico com preço congelado)
    UC-->>A: 201 com o orçamento parcial

    A->>C: POST /api/ordens-servico/{id}/itens-peca {pecaId, quantidade}
    C->>UC: AdicionarPecaUseCase (transação)
    UC->>P: GestaoDeEstoque.buscarPeca
    P-->>UC: nome e preço atual
    UC->>OS: adicionarPeca(ItemPeca com preço congelado)
    Note right of OS: itens só entram em RECEBIDA<br/>ou EM_DIAGNOSTICO, senão 422
    UC-->>A: 201

    A->>C: POST /api/ordens-servico/{id}/orcamento/enviar
    C->>UC: EnviarOrcamentoUseCase (transação)
    UC->>OS: enviarParaAprovacao()
    Note right of OS: exige ao menos um item<br/>orçamento = serviços + peças<br/>EM_DIAGNOSTICO para AGUARDANDO_APROVACAO
    UC->>R: salvar(ordem)
    UC-->>A: 200 {orcamento: valorServicos, valorPecas, valorTotal}
```

## 3. Aprovação do orçamento com baixa de estoque na mesma transação

Fluxo transacional crítico. A mudança de status da OS e a baixa de estoque das peças acontecem juntas ou não acontecem. A OS e as peças são lidas com bloqueio de linha: aprovações simultâneas da mesma OS rodam uma de cada vez, e só a primeira baixa o estoque. As peças são bloqueadas em ordem de identificador, o que evita deadlock entre aprovações com peças em comum. A aprovação pode vir do próprio cliente, pela rota pública (sequência 5), ou da equipe, pela rota administrativa.

<!-- diagrama: seq-3-aprovacao-transacao -->
```mermaid
sequenceDiagram
    autonumber
    actor A as Cliente ou equipe
    participant UC as AprovarOrcamentoUseCase
    participant UoW as UnidadeDeTrabalho
    participant RO as OrdemDeServicoRepository
    participant OS as OrdemDeServico
    participant GE as GestaoDeEstoqueAdapter
    participant RP as PecaRepository
    participant DB as PostgreSQL

    A->>UC: aprovar o orçamento da OS
    UC->>UoW: executar(operação)
    UoW->>DB: BEGIN
    Note over UoW: EntityManager da transação publicado<br/>no ContextoDeTransacao (AsyncLocalStorage)
    UC->>RO: buscarPorIdParaAtualizar(id)
    RO->>DB: SELECT ordens_servico FOR UPDATE
    RO-->>UC: ordem em AGUARDANDO_APROVACAO
    UC->>OS: aprovarOrcamento()
    Note right of OS: Aprovacao APROVADO<br/>AGUARDANDO_APROVACAO para EM_EXECUCAO<br/>iniciadaExecucaoEm = agora
    UC->>GE: baixar(itens de peça da OS)
    loop para cada peça, em ordem de id e com as quantidades somadas
        GE->>RP: buscarParaAtualizar(pecaId)
        RP->>DB: SELECT pecas FOR UPDATE
        RP-->>GE: peça bloqueada para esta transação
        break saldo menor que a quantidade
            GE-->>UC: RegraDeNegocioViolada (Peca.baixarEstoque)
            UoW->>DB: ROLLBACK
            UC-->>A: 422 com a ordem ainda em AGUARDANDO_APROVACAO e o estoque intacto
        end
        GE->>RP: salvar(peça com saldo reduzido)
        RP->>DB: UPDATE pecas
    end
    UC->>RO: salvar(ordem)
    RO->>DB: UPDATE ordens_servico
    UoW->>DB: COMMIT
    UC-->>A: 200 {status EM_EXECUCAO}
```

A rejeição segue o mesmo padrão transacional, com a OS lida com bloqueio. Ela registra a decisão com o motivo opcional e devolve a OS para `EM_DIAGNOSTICO`, sem mexer no estoque.

## 4. Finalização, entrega e tempo médio de execução

A finalização registra o instante usado no cálculo do tempo médio. Qualquer transição fora da máquina de estados é recusada pelo agregado com 422.

<!-- diagrama: seq-4-finalizacao-tempo-medio -->
```mermaid
sequenceDiagram
    autonumber
    actor M as Mecânico ou atendente
    participant C as OrdensServicoController
    participant UC as Caso de uso
    participant OS as OrdemDeServico
    participant R as OrdemDeServicoRepository

    M->>C: POST /api/ordens-servico/{id}/finalizar
    C->>UC: FinalizarOrdemUseCase (transação)
    UC->>R: buscarPorIdParaAtualizar(id)
    UC->>OS: finalizar()
    Note right of OS: EM_EXECUCAO para FINALIZADA<br/>finalizadaEm = agora
    UC->>R: salvar(ordem)
    UC-->>M: 200 {status FINALIZADA}

    M->>C: POST /api/ordens-servico/{id}/entregar
    C->>UC: EntregarVeiculoUseCase (transação)
    UC->>OS: entregar()
    Note right of OS: FINALIZADA para ENTREGUE<br/>entregueEm = agora
    UC-->>M: 200 {status ENTREGUE}

    M->>C: GET /api/ordens-servico/metricas/tempo-medio
    C->>UC: CalcularTempoMedioUseCase
    UC->>R: listar()
    R-->>UC: ordens
    UC->>UC: média de (finalizadaEm menos iniciadaExecucaoEm) das ordens já finalizadas
    UC-->>M: 200 {ordensConsideradas, tempoMedioEmMinutos, tempoMedioEmHoras}
```

## 5. Consulta e decisão do cliente pela API pública

Rotas sem JWT. O código da OS e o documento do cliente funcionam juntos como verificação, feita pelo `LocalizadorDeOrdemDoCliente`. Ordem inexistente e documento incorreto recebem a mesma resposta, o que impede descobrir códigos de ordens válidos por tentativa. Depois da verificação, a decisão usa os mesmos casos de uso transacionais da equipe.

<!-- diagrama: seq-5-consulta-publica -->
```mermaid
sequenceDiagram
    autonumber
    actor CL as Cliente
    participant PC as ConsultaPublicaController
    participant UC as Caso de uso público
    participant L as LocalizadorDeOrdemDoCliente
    participant AO as AprovarOrcamentoUseCase
    participant CV as ConsultaDeVeiculo

    CL->>PC: GET /api/acompanhamento/{codigo}?documento={CPF ou CNPJ}
    PC->>UC: ConsultarAndamentoUseCase
    UC->>L: localizar(codigo, documento)
    Note right of L: busca a OS pelo código e compara<br/>os dígitos do documento do cliente
    alt ordem inexistente ou documento de outra pessoa
        L-->>CL: 404 Ordem de servico nao encontrada ou documento invalido
    else verificação aprovada
        L-->>UC: ordem
        UC->>CV: buscarPorId(ordem.veiculoId)
        UC-->>CL: 200 {codigo, status, veiculo, valorTotalOrcamento, decisaoOrcamento, historico, datas}
    end

    CL->>PC: POST /api/acompanhamento/{codigo}/orcamento/aprovar {documento}
    PC->>UC: AprovarOrcamentoPeloClienteUseCase
    UC->>L: localizar(codigo, documento)
    alt verificação recusada
        L-->>CL: 404 (mesma mensagem genérica)
    else verificação aprovada
        UC->>AO: executar(ordem.id), ver sequência 3
        alt OS fora de AGUARDANDO_APROVACAO ou estoque insuficiente
            AO-->>CL: 422
        else aprovada
            UC-->>CL: 200 andamento atualizado {status EM_EXECUCAO, decisaoOrcamento APROVADO}
        end
    end
```

A rejeição pelo cliente (`POST /api/acompanhamento/{codigo}/orcamento/rejeitar`, com `documento` e `motivo` opcional) faz a mesma verificação e usa o `RejeitarOrcamentoUseCase`.
