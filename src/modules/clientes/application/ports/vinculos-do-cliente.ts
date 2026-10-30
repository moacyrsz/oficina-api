/**
 * Porta de consulta dos registros que dependem de um cliente. Usada para
 * impedir a remocao de um cliente que ainda tem veiculos ou historico de
 * atendimento.
 */
export interface VinculosDoCliente {
  possuiVeiculos(clienteId: string): Promise<boolean>;
  possuiOrdensDeServico(clienteId: string): Promise<boolean>;
}

export const VINCULOS_DO_CLIENTE = Symbol('VinculosDoCliente');
