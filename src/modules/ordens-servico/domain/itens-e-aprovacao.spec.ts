import { Dinheiro } from '../../../shared/domain/dinheiro';
import { ErroDeValidacao } from '../../../shared/domain/excecoes';
import { Aprovacao, DecisaoOrcamento } from './aprovacao';
import { ItemPeca } from './item-peca';
import { ItemServico } from './item-servico';
import { OrdemDeServico } from './ordem-de-servico';

describe('ItemServico', () => {
  it('calcula o subtotal pela quantidade', () => {
    const item = ItemServico.criar({
      servicoId: 's1',
      descricao: 'Alinhamento',
      valorUnitario: Dinheiro.deReais(80),
      quantidade: 2,
    });
    expect(item.subtotal.reais).toBe(160);
    expect(item.descricao).toBe('Alinhamento');
  });

  it('exige servico e quantidade valida', () => {
    const base = { descricao: 'x', valorUnitario: Dinheiro.deReais(10) };
    expect(() => ItemServico.criar({ servicoId: '', quantidade: 1, ...base })).toThrow(ErroDeValidacao);
    expect(() => ItemServico.criar({ servicoId: 's', quantidade: 0, ...base })).toThrow(ErroDeValidacao);
    expect(() => ItemServico.criar({ servicoId: 's', quantidade: 1.5, ...base })).toThrow(ErroDeValidacao);
  });
});

describe('ItemPeca', () => {
  it('calcula o subtotal pela quantidade', () => {
    const item = ItemPeca.criar({
      pecaId: 'p1',
      descricao: 'Pastilha',
      valorUnitario: Dinheiro.deReais(45),
      quantidade: 4,
    });
    expect(item.subtotal.reais).toBe(180);
    expect(item.descricao).toBe('Pastilha');
  });

  it('exige peca e quantidade valida', () => {
    const base = { descricao: 'x', valorUnitario: Dinheiro.deReais(10) };
    expect(() => ItemPeca.criar({ pecaId: '', quantidade: 1, ...base })).toThrow(ErroDeValidacao);
    expect(() => ItemPeca.criar({ pecaId: 'p', quantidade: -1, ...base })).toThrow(ErroDeValidacao);
    expect(() => ItemPeca.criar({ pecaId: 'p', quantidade: 2.3, ...base })).toThrow(ErroDeValidacao);
  });
});

describe('Aprovacao', () => {
  it('representa uma aprovacao', () => {
    const aprovacao = Aprovacao.aprovar(new Date());
    expect(aprovacao.aprovado).toBe(true);
    expect(aprovacao.decisao).toBe(DecisaoOrcamento.APROVADO);
    expect(aprovacao.motivo).toBeUndefined();
  });

  it('representa uma rejeicao com motivo', () => {
    const aprovacao = Aprovacao.rejeitar(new Date(), 'Preco alto');
    expect(aprovacao.aprovado).toBe(false);
    expect(aprovacao.decisao).toBe(DecisaoOrcamento.REJEITADO);
    expect(aprovacao.motivo).toBe('Preco alto');
  });

  it('reconstroi a partir das propriedades persistidas', () => {
    const aprovacao = Aprovacao.restaurar({
      decisao: DecisaoOrcamento.APROVADO,
      registradoEm: new Date(),
    });
    expect(aprovacao.aprovado).toBe(true);
    expect(aprovacao.registradoEm).toBeInstanceOf(Date);
  });
});

describe('OrdemDeServico (consultas auxiliares)', () => {
  it('nao calcula duracao de execucao antes de finalizar', () => {
    const ordem = OrdemDeServico.criar({ clienteId: 'c', veiculoId: 'v' });
    expect(ordem.duracaoExecucaoEmMs).toBeNull();
    expect(ordem.iniciadaExecucaoEm).toBeNull();
    expect(ordem.finalizadaEm).toBeNull();
    expect(ordem.entregueEm).toBeNull();
    expect(ordem.aprovacao).toBeNull();
  });
});
