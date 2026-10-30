# Linguagem Ubíqua

A linguagem ubíqua reúne os termos usados pela oficina e pela equipe de desenvolvimento. Os mesmos nomes aparecem nas conversas de negócio, na documentação e no código (classes, métodos e rotas), para reduzir ruído de tradução entre o domínio e a implementação.

## Termos do domínio

| Termo | Significado | Onde aparece no código |
|-------|-------------|------------------------|
| Cliente | Pessoa física ou jurídica dona de um ou mais veículos, identificada por CPF ou CNPJ. | `modules/clientes/domain/cliente.ts` |
| Documento | CPF ou CNPJ do cliente, validado por dígito verificador. | `modules/clientes/domain/documento.ts` |
| Veículo | Automóvel atendido pela oficina, identificado pela placa e vinculado a um cliente. | `modules/veiculos/domain/veiculo.ts` |
| Placa | Identificação do veículo nos formatos antigo (ABC1234) e Mercosul (ABC1D23). | `modules/veiculos/domain/placa.ts` |
| Serviço | Trabalho oferecido pela oficina, como troca de óleo ou alinhamento, com um preço. | `modules/servicos/domain/servico.ts` |
| Peça (ou Insumo) | Item físico aplicado no veículo, com preço unitário e saldo em estoque. | `modules/pecas/domain/peca.ts` |
| Estoque | Saldo disponível de uma peça. Nunca pode ficar negativo. | método `baixarEstoque` em `peca.ts` |
| Ordem de Serviço (OS) | Registro do atendimento de um veículo, do recebimento à entrega. É o agregado central. | `modules/ordens-servico/domain/ordem-de-servico.ts` |
| Item de Serviço | Serviço incluído em uma OS, com preço e quantidade capturados no momento da inclusão. | `item-servico.ts` |
| Item de Peça | Peça incluída em uma OS, com preço e quantidade capturados no momento da inclusão. | `item-peca.ts` |
| Orçamento | Soma dos itens de serviço e de peça de uma OS. É calculado, não digitado. | `orcamento.ts` |
| Aprovação | Decisão do cliente sobre o orçamento: aprovado ou rejeitado. | `aprovacao.ts` |
| Status da OS | Etapa atual do atendimento. Muda apenas por transições válidas. | `status-ordem-servico.ts` |
| Diagnóstico | Etapa em que a oficina avalia o veículo e monta o orçamento. | status `EM_DIAGNOSTICO` |
| Tempo médio de execução | Média da duração entre o início da execução e a finalização das ordens concluídas. | `calcular-tempo-medio.use-case.ts` |
| Usuário administrativo | Operador da oficina que autentica para usar as APIs internas. | `modules/auth/domain/usuario.ts` |

## Verbos do domínio (comandos e transições)

| Expressão de negócio | Método no agregado | Efeito |
|----------------------|--------------------|--------|
| Abrir uma ordem de serviço | `OrdemDeServico.criar` | Cria a OS no status Recebida, para o cliente do CPF/CNPJ e o veículo da placa informados. |
| Iniciar o diagnóstico | `iniciarDiagnostico` | Recebida passa para Em diagnóstico. |
| Incluir serviço na ordem | `adicionarServico` | Adiciona um item de serviço (apenas antes do envio do orçamento). |
| Incluir peça na ordem | `adicionarPeca` | Adiciona um item de peça. |
| Enviar o orçamento | `enviarParaAprovacao` | Em diagnóstico passa para Aguardando aprovação. |
| Aprovar o orçamento | `aprovarOrcamento` | Registra a aprovação e passa para Em execução. Feito pelo cliente na API pública ou pela equipe em nome dele. |
| Rejeitar o orçamento | `rejeitarOrcamento` | Registra a rejeição e volta para Em diagnóstico. Feito pelo cliente na API pública ou pela equipe em nome dele. |
| Finalizar a ordem | `finalizar` | Em execução passa para Finalizada. |
| Entregar o veículo | `entregar` | Finalizada passa para Entregue. |

## Status da Ordem de Serviço

Recebida, Em diagnóstico, Aguardando aprovação, Em execução, Finalizada, Entregue. As transições permitidas estão descritas em [diagramas.md](diagramas.md) e implementadas em `status-ordem-servico.ts`.
