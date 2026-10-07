import { Usuario } from './usuario';

/**
 * Porta de persistencia do agregado Usuario.
 */
export interface UsuarioRepository {
  buscarPorEmail(email: string): Promise<Usuario | null>;
  salvar(usuario: Usuario): Promise<void>;
}

export const USUARIO_REPOSITORY = Symbol('UsuarioRepository');
