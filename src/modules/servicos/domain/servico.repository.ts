import { Servico } from './servico';

export interface ServicoRepository {
  salvar(servico: Servico): Promise<void>;
  buscarPorId(id: string): Promise<Servico | null>;
  listar(): Promise<Servico[]>;
  remover(id: string): Promise<void>;
}

export const SERVICO_REPOSITORY = Symbol('ServicoRepository');
