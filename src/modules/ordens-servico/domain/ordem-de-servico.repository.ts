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
  /**
   * Busca a ordem com intencao de altera-la dentro de uma transacao. A
   * implementacao aplica bloqueio pessimista quando o banco suporta, de modo
   * que comandos concorrentes na mesma ordem sejam executados um de cada vez.
   */
  buscarPorIdParaAtualizar(id: string): Promise<OrdemDeServico | null>;
  buscarPorCodigo(codigo: string): Promise<OrdemDeServico | null>;
  listar(filtro?: FiltroDeOrdens): Promise<OrdemDeServico[]>;
}

export const ORDEM_DE_SERVICO_REPOSITORY = Symbol('OrdemDeServicoRepository');
