/**
 * Estados possiveis de uma Ordem de Servico e as regras de transicao entre eles.
 * A maquina de estados e a regra de negocio central do acompanhamento da OS.
 */
export enum StatusOrdemServico {
  RECEBIDA = 'RECEBIDA',
  EM_DIAGNOSTICO = 'EM_DIAGNOSTICO',
  AGUARDANDO_APROVACAO = 'AGUARDANDO_APROVACAO',
  EM_EXECUCAO = 'EM_EXECUCAO',
  FINALIZADA = 'FINALIZADA',
  ENTREGUE = 'ENTREGUE',
}

/**
 * Transicoes permitidas. A partir de "Aguardando aprovacao" a ordem segue para
 * "Em execucao" quando o orcamento e aprovado, ou retorna para "Em diagnostico"
 * quando o orcamento e rejeitado, permitindo uma nova rodada de orcamento.
 */
export const TRANSICOES_PERMITIDAS: Readonly<Record<StatusOrdemServico, ReadonlyArray<StatusOrdemServico>>> = {
  [StatusOrdemServico.RECEBIDA]: [StatusOrdemServico.EM_DIAGNOSTICO],
  [StatusOrdemServico.EM_DIAGNOSTICO]: [StatusOrdemServico.AGUARDANDO_APROVACAO],
  [StatusOrdemServico.AGUARDANDO_APROVACAO]: [
    StatusOrdemServico.EM_EXECUCAO,
    StatusOrdemServico.EM_DIAGNOSTICO,
  ],
  [StatusOrdemServico.EM_EXECUCAO]: [StatusOrdemServico.FINALIZADA],
  [StatusOrdemServico.FINALIZADA]: [StatusOrdemServico.ENTREGUE],
  [StatusOrdemServico.ENTREGUE]: [],
};

export function transicaoPermitida(
  origem: StatusOrdemServico,
  destino: StatusOrdemServico,
): boolean {
  return TRANSICOES_PERMITIDAS[origem].includes(destino);
}
