import { ErroDeValidacao } from '../../../shared/domain/excecoes';
import { Usuario } from './usuario';

describe('Usuario', () => {
  it('cria um usuario valido e normaliza o email', () => {
    const usuario = Usuario.criar({ nome: '  Administrador ', email: '  ADMIN@Oficina.com.br ', senhaHash: 'hash' });
    expect(usuario.nome).toBe('Administrador');
    expect(usuario.email).toBe('admin@oficina.com.br');
    expect(usuario.senhaHash).toBe('hash');
    expect(usuario.id).toBeTruthy();
  });

  it('exige nome', () => {
    expect(() => Usuario.criar({ nome: '', email: 'a@b.com', senhaHash: 'h' })).toThrow(ErroDeValidacao);
  });

  it('exige email', () => {
    expect(() => Usuario.criar({ nome: 'A', email: '', senhaHash: 'h' })).toThrow(ErroDeValidacao);
  });

  it('exige hash de senha', () => {
    expect(() => Usuario.criar({ nome: 'A', email: 'a@b.com', senhaHash: '' })).toThrow(ErroDeValidacao);
  });

  it('restaura a partir das propriedades persistidas', () => {
    const usuario = Usuario.restaurar(
      { nome: 'Admin', email: 'admin@oficina.com.br', senhaHash: 'hash' },
      'usuario-1',
    );
    expect(usuario.id).toBe('usuario-1');
    expect(usuario.email).toBe('admin@oficina.com.br');
  });
});
