/**
 * Porta de consulta dos registros que dependem de um veiculo. Usada para
 * impedir a remocao de um veiculo que ja tem historico de atendimento.
 */
export interface VinculosDoVeiculo {
  possuiOrdensDeServico(veiculoId: string): Promise<boolean>;
}

export const VINCULOS_DO_VEICULO = Symbol('VinculosDoVeiculo');
