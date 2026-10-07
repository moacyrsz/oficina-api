import { Cliente } from './cliente';
import { Documento } from './documento';
import { ClienteCadastrado } from './eventos';
import { ErroDeValidacao } from '../../../shared/domain/excecoes';

function documentoValido(): Documento {
  return Documento.criar('52998224725');
}

function dadosValidos() {
  return {
    nome: 'Maria Oliveira',
    documento: documentoValido(),
    email: 'maria@email.com',
    telefone: '(11) 98888-7777',
  };
}

describe('Cliente', () => {
  describe('criacao', () => {
    it('cria um cliente com os dados informados e gera um id', () => {
      const cliente = Cliente.criar(dadosValidos());
      expect(cliente.id).toBeDefined();
      expect(cliente.nome).toBe('Maria Oliveira');
      expect(cliente.documento.valor).toBe('52998224725');
      expect(cliente.email).toBe('maria@email.com');
      expect(cliente.telefone).toBe('(11) 98888-7777');
    });

    it('respeita o id informado quando fornecido', () => {
      const cliente = Cliente.criar(dadosValidos(), 'id-fixo');
      expect(cliente.id).toBe('id-fixo');
    });

    it('normaliza nome e email', () => {
      const cliente = Cliente.criar({
        ...dadosValidos(),
        nome: '  Joao  ',
        email: '  JOAO@EMAIL.COM  ',
      });
      expect(cliente.nome).toBe('Joao');
      expect(cliente.email).toBe('joao@email.com');
    });

    it('registra o evento ClienteCadastrado', () => {
      const cliente = Cliente.criar(dadosValidos());
      expect(cliente.eventos).toHaveLength(1);
      expect(cliente.eventos[0]).toBeInstanceOf(ClienteCadastrado);
      expect(cliente.eventos[0].idDoAgregado).toBe(cliente.id);
    });

    it('rejeita nome vazio', () => {
      expect(() => Cliente.criar({ ...dadosValidos(), nome: '   ' })).toThrow(ErroDeValidacao);
    });

    it('rejeita email sem arroba', () => {
      expect(() => Cliente.criar({ ...dadosValidos(), email: 'invalido' })).toThrow(ErroDeValidacao);
    });

    it('rejeita telefone vazio', () => {
      expect(() => Cliente.criar({ ...dadosValidos(), telefone: '' })).toThrow(ErroDeValidacao);
    });

    it('rejeita documento ausente', () => {
      expect(() =>
        Cliente.criar({ ...dadosValidos(), documento: undefined as unknown as Documento }),
      ).toThrow(ErroDeValidacao);
    });
  });

  describe('restauracao', () => {
    it('restaura o cliente sem gerar eventos', () => {
      const cliente = Cliente.restaurar(dadosValidos(), 'id-fixo');
      expect(cliente.id).toBe('id-fixo');
      expect(cliente.eventos).toHaveLength(0);
    });
  });

  describe('atualizacao', () => {
    it('atualiza os campos informados mantendo os demais', () => {
      const cliente = Cliente.criar(dadosValidos());
      cliente.atualizar({ nome: 'Maria Souza', telefone: '(11) 90000-0000' });
      expect(cliente.nome).toBe('Maria Souza');
      expect(cliente.telefone).toBe('(11) 90000-0000');
      expect(cliente.email).toBe('maria@email.com');
      expect(cliente.documento.valor).toBe('52998224725');
    });

    it('normaliza o email ao atualizar', () => {
      const cliente = Cliente.criar(dadosValidos());
      cliente.atualizar({ email: '  NOVO@EMAIL.COM  ' });
      expect(cliente.email).toBe('novo@email.com');
    });

    it('nao altera nada quando chamado sem campos', () => {
      const cliente = Cliente.criar(dadosValidos());
      cliente.atualizar({});
      expect(cliente.nome).toBe('Maria Oliveira');
      expect(cliente.email).toBe('maria@email.com');
      expect(cliente.telefone).toBe('(11) 98888-7777');
    });

    it('rejeita atualizacao com nome vazio', () => {
      const cliente = Cliente.criar(dadosValidos());
      expect(() => cliente.atualizar({ nome: '   ' })).toThrow(ErroDeValidacao);
    });

    it('rejeita atualizacao com email invalido', () => {
      const cliente = Cliente.criar(dadosValidos());
      expect(() => cliente.atualizar({ email: 'sem-arroba' })).toThrow(ErroDeValidacao);
    });

    it('rejeita atualizacao com telefone vazio', () => {
      const cliente = Cliente.criar(dadosValidos());
      expect(() => cliente.atualizar({ telefone: '  ' })).toThrow(ErroDeValidacao);
    });
  });
});
