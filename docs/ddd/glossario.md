# Glossário

Definições dos principais termos do domínio da oficina, em linguagem de negócio.

- **Ordem de Serviço (OS)**: documento que concentra todo o atendimento de um veículo, desde a chegada até a entrega. Reúne os serviços e as peças, o orçamento, a decisão do cliente e o histórico de status.

- **Cliente**: dono do veículo. Identificado por CPF (pessoa física) ou CNPJ (pessoa jurídica).

- **Veículo**: automóvel que recebe os serviços. Identificado pela placa e vinculado a um cliente.

- **Serviço**: trabalho oferecido pela oficina com um preço de tabela, por exemplo troca de óleo ou alinhamento.

- **Peça / Insumo**: item físico aplicado no veículo, com preço unitário e saldo em estoque, por exemplo um filtro ou pastilhas de freio.

- **Estoque**: quantidade disponível de uma peça. É reduzido quando o orçamento é aprovado e reposto por entrada manual.

- **Orçamento**: valor total do atendimento, calculado automaticamente pela soma dos serviços e das peças incluídos na OS. É apresentado ao cliente para aprovação.

- **Aprovação**: decisão do cliente sobre o orçamento. Pode ser uma aprovação, que libera a execução, ou uma rejeição, que devolve a OS para o diagnóstico.

- **Status da OS**: etapa atual do atendimento. Os valores possíveis são Recebida, Em diagnóstico, Aguardando aprovação, Em execução, Finalizada e Entregue.

- **Diagnóstico**: etapa em que a oficina avalia o veículo, define os serviços e as peças necessárias e monta o orçamento.

- **Execução**: etapa em que os serviços aprovados são realizados.

- **Entrega**: devolução do veículo ao cliente, que encerra a ordem.

- **Tempo médio de execução**: indicador de gestão. É a média do tempo entre o início da execução e a finalização das ordens já concluídas.

- **Usuário administrativo**: funcionário da oficina que acessa as APIs internas. Precisa se autenticar para operar o sistema.

- **Código da OS**: identificador curto e legível de uma ordem (por exemplo OS-1A2B3C4D), usado pelo cliente na consulta de acompanhamento.
