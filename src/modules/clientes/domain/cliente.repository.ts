import { Cliente } from './cliente';

/**
 * Porta de persistencia do agregado Cliente.
 */
export interface ClienteRepository {
  salvar(cliente: Cliente): Promise<void>;
  buscarPorId(id: string): Promise<Cliente | null>;
  buscarPorDocumento(documento: string): Promise<Cliente | null>;
  listar(): Promise<Cliente[]>;
  remover(id: string): Promise<void>;
}

export const CLIENTE_REPOSITORY = Symbol('ClienteRepository');
