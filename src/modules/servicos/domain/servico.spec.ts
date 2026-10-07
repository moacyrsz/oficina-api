import { Dinheiro } from '../../../shared/domain/dinheiro';
import { ErroDeValidacao } from '../../../shared/domain/excecoes';
import { Servico } from './servico';

function servicoNovo(valorReais = 150): Servico {
  return Servico.criar({
    nome: 'Troca de oleo',
    descricao: 'Substituicao do oleo do motor',
    valor: Dinheiro.deReais(valorReais),
  });
}

describe('Servico', () => {
  describe('criacao', () => {
    it('cria o servico com nome, descricao e valor em Dinheiro', () => {
      const servico = servicoNovo(150);

      expect(servico.nome).toBe('Troca de oleo');
      expect(servico.descricao).toBe('Substituicao do oleo do motor');
      expect(servico.valor).toBeInstanceOf(Dinheiro);
      expect(servico.valor.reais).toBe(150);
      expect(servico.valor.centavos).toBe(15000);
    });

    it('gera um id quando nenhum e informado', () => {
      const servico = servicoNovo();
      expect(servico.id).toBeDefined();
      expect(servico.id).toHaveLength(36);
    });

    it('mantem o id informado', () => {
      const id = '11111111-1111-1111-1111-111111111111';
      const servico = Servico.criar(
        { nome: 'Alinhamento', descricao: '', valor: Dinheiro.deReais(80) },
        id,
      );
      expect(servico.id).toBe(id);
    });

    it('remove espacos em branco do nome', () => {
      const servico = Servico.criar({
        nome: '  Balanceamento  ',
        descricao: '  roda  ',
        valor: Dinheiro.deReais(60),
      });
      expect(servico.nome).toBe('Balanceamento');
      expect(servico.descricao).toBe('roda');
    });

    it('assume descricao vazia quando nao informada', () => {
      const servico = Servico.criar({ nome: 'Revisao', valor: Dinheiro.deReais(200) });
      expect(servico.descricao).toBe('');
    });

    it('exige nome', () => {
      expect(() =>
        Servico.criar({ nome: '', descricao: 'x', valor: Dinheiro.deReais(10) }),
      ).toThrow(ErroDeValidacao);
    });

    it('rejeita nome composto apenas por espacos', () => {
      expect(() =>
        Servico.criar({ nome: '   ', descricao: 'x', valor: Dinheiro.deReais(10) }),
      ).toThrow(ErroDeValidacao);
    });
  });

  describe('restauracao', () => {
    it('restaura o agregado preservando os valores persistidos', () => {
      const id = '22222222-2222-2222-2222-222222222222';
      const servico = Servico.restaurar(
        { nome: 'Diagnostico', descricao: 'eletronico', valor: Dinheiro.deCentavos(12345) },
        id,
      );

      expect(servico.id).toBe(id);
      expect(servico.nome).toBe('Diagnostico');
      expect(servico.descricao).toBe('eletronico');
      expect(servico.valor.centavos).toBe(12345);
      expect(servico.valor.reais).toBe(123.45);
    });
  });

  describe('atualizacao', () => {
    it('atualiza nome, descricao e valor quando informados', () => {
      const servico = servicoNovo(150);

      servico.atualizar({
        nome: 'Troca de oleo sintetico',
        descricao: 'Oleo sintetico premium',
        valor: Dinheiro.deReais(220),
      });

      expect(servico.nome).toBe('Troca de oleo sintetico');
      expect(servico.descricao).toBe('Oleo sintetico premium');
      expect(servico.valor.reais).toBe(220);
      expect(servico.valor.centavos).toBe(22000);
    });

    it('altera apenas os campos informados', () => {
      const servico = servicoNovo(150);

      servico.atualizar({ valor: Dinheiro.deReais(199.9) });

      expect(servico.nome).toBe('Troca de oleo');
      expect(servico.descricao).toBe('Substituicao do oleo do motor');
      expect(servico.valor.reais).toBe(199.9);
    });

    it('mantem o valor quando apenas o nome e atualizado', () => {
      const servico = servicoNovo(150);

      servico.atualizar({ nome: 'Novo nome' });

      expect(servico.nome).toBe('Novo nome');
      expect(servico.valor.reais).toBe(150);
    });

    it('remove espacos do nome e da descricao atualizados', () => {
      const servico = servicoNovo(150);

      servico.atualizar({ nome: '  Nome limpo  ', descricao: '  desc  ' });

      expect(servico.nome).toBe('Nome limpo');
      expect(servico.descricao).toBe('desc');
    });

    it('rejeita atualizacao de nome para valor vazio', () => {
      const servico = servicoNovo(150);
      expect(() => servico.atualizar({ nome: '   ' })).toThrow(ErroDeValidacao);
    });
  });
});
