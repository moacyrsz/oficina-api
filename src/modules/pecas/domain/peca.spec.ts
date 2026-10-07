import { Dinheiro } from '../../../shared/domain/dinheiro';
import { ErroDeValidacao, RegraDeNegocioViolada } from '../../../shared/domain/excecoes';
import { Peca } from './peca';

function novaPeca(quantidadeEmEstoque = 10): Peca {
  return Peca.criar({
    nome: 'Filtro de oleo',
    descricao: 'Filtro de oleo compativel com motores 1.0 a 2.0',
    precoUnitario: Dinheiro.deReais(49.9),
    quantidadeEmEstoque,
  });
}

describe('Peca', () => {
  describe('criacao', () => {
    it('cria a peca com os dados informados', () => {
      const peca = novaPeca(10);
      expect(peca.nome).toBe('Filtro de oleo');
      expect(peca.descricao).toBe('Filtro de oleo compativel com motores 1.0 a 2.0');
      expect(peca.precoUnitario.reais).toBe(49.9);
      expect(peca.quantidadeEmEstoque).toBe(10);
      expect(peca.id).toBeDefined();
    });

    it('aceita estoque inicial igual a zero', () => {
      const peca = novaPeca(0);
      expect(peca.quantidadeEmEstoque).toBe(0);
    });

    it('usa descricao vazia quando nao informada', () => {
      const peca = Peca.criar({
        nome: 'Vela de ignicao',
        precoUnitario: Dinheiro.deReais(20),
        quantidadeEmEstoque: 5,
      });
      expect(peca.descricao).toBe('');
    });

    it('exige nome', () => {
      expect(() =>
        Peca.criar({
          nome: '   ',
          precoUnitario: Dinheiro.deReais(10),
          quantidadeEmEstoque: 1,
        }),
      ).toThrow(ErroDeValidacao);
    });

    it('rejeita estoque inicial negativo', () => {
      expect(() =>
        Peca.criar({
          nome: 'Correia dentada',
          precoUnitario: Dinheiro.deReais(80),
          quantidadeEmEstoque: -1,
        }),
      ).toThrow(ErroDeValidacao);
    });

    it('rejeita estoque inicial fracionario', () => {
      expect(() =>
        Peca.criar({
          nome: 'Correia dentada',
          precoUnitario: Dinheiro.deReais(80),
          quantidadeEmEstoque: 2.5,
        }),
      ).toThrow(ErroDeValidacao);
    });
  });

  describe('baixa de estoque', () => {
    it('subtrai a quantidade do saldo disponivel', () => {
      const peca = novaPeca(10);
      peca.baixarEstoque(3);
      expect(peca.quantidadeEmEstoque).toBe(7);
    });

    it('permite zerar o estoque', () => {
      const peca = novaPeca(4);
      peca.baixarEstoque(4);
      expect(peca.quantidadeEmEstoque).toBe(0);
    });

    it('rejeita baixa maior que o estoque disponivel', () => {
      const peca = novaPeca(2);
      expect(() => peca.baixarEstoque(5)).toThrow(RegraDeNegocioViolada);
      expect(peca.quantidadeEmEstoque).toBe(2);
    });

    it('cita a peca e as quantidades na mensagem de estoque insuficiente', () => {
      const peca = novaPeca(2);
      expect(() => peca.baixarEstoque(5)).toThrow(/Filtro de oleo/);
      expect(() => peca.baixarEstoque(5)).toThrow(/disponivel 2/);
      expect(() => peca.baixarEstoque(5)).toThrow(/solicitado 5/);
    });

    it('rejeita baixa de quantidade zero', () => {
      const peca = novaPeca(10);
      expect(() => peca.baixarEstoque(0)).toThrow(ErroDeValidacao);
    });

    it('rejeita baixa de quantidade negativa', () => {
      const peca = novaPeca(10);
      expect(() => peca.baixarEstoque(-2)).toThrow(ErroDeValidacao);
    });

    it('rejeita baixa de quantidade fracionaria', () => {
      const peca = novaPeca(10);
      expect(() => peca.baixarEstoque(1.5)).toThrow(ErroDeValidacao);
    });
  });

  describe('reposicao de estoque', () => {
    it('soma a quantidade ao saldo atual', () => {
      const peca = novaPeca(10);
      peca.reporEstoque(5);
      expect(peca.quantidadeEmEstoque).toBe(15);
    });

    it('rejeita reposicao de quantidade zero', () => {
      const peca = novaPeca(10);
      expect(() => peca.reporEstoque(0)).toThrow(ErroDeValidacao);
    });

    it('rejeita reposicao de quantidade negativa', () => {
      const peca = novaPeca(10);
      expect(() => peca.reporEstoque(-3)).toThrow(ErroDeValidacao);
    });

    it('rejeita reposicao de quantidade fracionaria', () => {
      const peca = novaPeca(10);
      expect(() => peca.reporEstoque(2.5)).toThrow(ErroDeValidacao);
    });
  });

  describe('atualizacao de dados cadastrais', () => {
    it('atualiza nome, descricao e preco sem tocar no estoque', () => {
      const peca = novaPeca(10);
      peca.atualizar({
        nome: 'Filtro de ar',
        descricao: 'Novo filtro',
        precoUnitario: Dinheiro.deReais(59.9),
      });
      expect(peca.nome).toBe('Filtro de ar');
      expect(peca.descricao).toBe('Novo filtro');
      expect(peca.precoUnitario.reais).toBe(59.9);
      expect(peca.quantidadeEmEstoque).toBe(10);
    });

    it('mantem os valores atuais quando nenhum campo e informado', () => {
      const peca = novaPeca(10);
      peca.atualizar({});
      expect(peca.nome).toBe('Filtro de oleo');
      expect(peca.precoUnitario.reais).toBe(49.9);
    });

    it('rejeita nome vazio na atualizacao', () => {
      const peca = novaPeca(10);
      expect(() => peca.atualizar({ nome: '  ' })).toThrow(ErroDeValidacao);
    });
  });

  describe('restauracao', () => {
    it('reconstroi a peca a partir das propriedades persistidas', () => {
      const peca = Peca.restaurar(
        {
          nome: 'Pastilha de freio',
          descricao: 'Jogo dianteiro',
          precoUnitario: Dinheiro.deCentavos(12990),
          quantidadeEmEstoque: 8,
        },
        'peca-1',
      );
      expect(peca.id).toBe('peca-1');
      expect(peca.precoUnitario.centavos).toBe(12990);
      expect(peca.quantidadeEmEstoque).toBe(8);
    });
  });
});
