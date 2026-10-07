import { FalhaDeAutenticacao } from '../../../shared/domain/excecoes';
import { Usuario } from '../domain/usuario';
import { UsuarioRepository } from '../domain/usuario.repository';
import { AutenticarUseCase } from './autenticar.use-case';
import { HashDeSenha } from './ports/hash-de-senha';
import { ServicoDeToken, TokenEmitido } from './ports/servico-de-token';

class UsuarioRepositoryFake implements UsuarioRepository {
  constructor(private readonly usuario: Usuario | null) {}
  public async buscarPorEmail(): Promise<Usuario | null> {
    return this.usuario;
  }
  public async salvar(): Promise<void> {
    // nao utilizado neste teste
  }
}

class HashFake implements HashDeSenha {
  constructor(private readonly confere: boolean) {}
  public async gerar(): Promise<string> {
    return 'hash';
  }
  public async comparar(): Promise<boolean> {
    return this.confere;
  }
}

class TokenFake implements ServicoDeToken {
  public async gerar(): Promise<TokenEmitido> {
    return { accessToken: 'token-jwt', tipo: 'Bearer', expiraEm: '3600s' };
  }
}

function usuarioDemo(): Usuario {
  return Usuario.criar({ nome: 'Admin', email: 'admin@oficina.com.br', senhaHash: 'hash-armazenado' });
}

describe('AutenticarUseCase', () => {
  it('emite token quando as credenciais sao validas', async () => {
    const useCase = new AutenticarUseCase(
      new UsuarioRepositoryFake(usuarioDemo()),
      new HashFake(true),
      new TokenFake(),
    );
    const resultado = await useCase.executar({ email: 'admin@oficina.com.br', senha: 'Admin@123' });
    expect(resultado.accessToken).toBe('token-jwt');
    expect(resultado.tipo).toBe('Bearer');
  });

  it('falha quando o usuario nao existe', async () => {
    const useCase = new AutenticarUseCase(
      new UsuarioRepositoryFake(null),
      new HashFake(true),
      new TokenFake(),
    );
    await expect(
      useCase.executar({ email: 'ausente@oficina.com.br', senha: 'x' }),
    ).rejects.toBeInstanceOf(FalhaDeAutenticacao);
  });

  it('falha quando a senha nao confere', async () => {
    const useCase = new AutenticarUseCase(
      new UsuarioRepositoryFake(usuarioDemo()),
      new HashFake(false),
      new TokenFake(),
    );
    await expect(
      useCase.executar({ email: 'admin@oficina.com.br', senha: 'errada' }),
    ).rejects.toBeInstanceOf(FalhaDeAutenticacao);
  });
});
