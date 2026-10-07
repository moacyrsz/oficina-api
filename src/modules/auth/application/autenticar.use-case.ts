import { Inject, Injectable } from '@nestjs/common';
import { FalhaDeAutenticacao } from '../../../shared/domain/excecoes';
import { USUARIO_REPOSITORY, UsuarioRepository } from '../domain/usuario.repository';
import { HASH_DE_SENHA, HashDeSenha } from './ports/hash-de-senha';
import { SERVICO_DE_TOKEN, ServicoDeToken, TokenEmitido } from './ports/servico-de-token';

export interface EntradaAutenticar {
  email: string;
  senha: string;
}

/**
 * Caso de uso de autenticacao. Valida as credenciais do usuario administrativo
 * e emite um token JWT. Falhas de credencial retornam sempre a mesma mensagem
 * generica para nao revelar se o email existe.
 */
@Injectable()
export class AutenticarUseCase {
  constructor(
    @Inject(USUARIO_REPOSITORY) private readonly usuarios: UsuarioRepository,
    @Inject(HASH_DE_SENHA) private readonly hash: HashDeSenha,
    @Inject(SERVICO_DE_TOKEN) private readonly token: ServicoDeToken,
  ) {}

  public async executar(entrada: EntradaAutenticar): Promise<TokenEmitido> {
    const email = entrada.email?.trim().toLowerCase();
    const usuario = await this.usuarios.buscarPorEmail(email);

    if (!usuario) {
      throw new FalhaDeAutenticacao();
    }

    const senhaConfere = await this.hash.comparar(entrada.senha, usuario.senhaHash);
    if (!senhaConfere) {
      throw new FalhaDeAutenticacao();
    }

    return this.token.gerar({ id: usuario.id, email: usuario.email });
  }
}
