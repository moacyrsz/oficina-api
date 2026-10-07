import { OrdemDeServico } from './ordem-de-servico';
import { StatusOrdemServico } from './status-ordem-servico';

export interface FiltroDeOrdens {
  status?: StatusOrdemServico;
}

/**
 * Porta de persistencia do agregado Ordem de Servico.
 */
export interface OrdemDeServicoRepository {
  salvar(ordem: OrdemDeServico): Promise<void>;
  buscarPorId(id: string): Promise<OrdemDeServico | null>;
  buscarPorCodigo(codigo: string): Promise<OrdemDeServico | null>;
  listar(filtro?: FiltroDeOrdens): Promise<OrdemDeServico[]>;
}

export const ORDEM_DE_SERVICO_REPOSITORY = Symbol('OrdemDeServicoRepository');
