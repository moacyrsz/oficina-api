import { Peca } from './peca';

export interface PecaRepository {
  salvar(peca: Peca): Promise<void>;
  buscarPorId(id: string): Promise<Peca | null>;
  /**
   * Busca a peca com intencao de altera-la dentro de uma transacao. A
   * implementacao aplica bloqueio pessimista quando o banco suporta, evitando
   * que duas operacoes leiam o mesmo saldo e uma sobrescreva a outra.
   */
  buscarParaAtualizar(id: string): Promise<Peca | null>;
  listar(): Promise<Peca[]>;
  remover(id: string): Promise<void>;
}

export const PECA_REPOSITORY = Symbol('PecaRepository');
