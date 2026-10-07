import { Dinheiro } from './dinheiro';
import { ItemServico } from '../../modules/ordens-servico/domain/item-servico';
import { OrdemDeServico } from '../../modules/ordens-servico/domain/ordem-de-servico';

/**
 * Cobre o comportamento das bases de dominio (Entidade, ObjetoDeValor e
 * RaizDeAgregado) atraves de tipos concretos que as estendem.
 */
describe('Bases de dominio', () => {
  describe('Entidade (igualdade por identidade)', () => {
    const base = { servicoId: 's', descricao: 'd', valorUnitario: Dinheiro.zero(), quantidade: 1 };
    const a = ItemServico.restaurar(base, 'id-1');
    const mesmaIdentidade = ItemServico.restaurar(base, 'id-1');
    const outraIdentidade = ItemServico.restaurar(base, 'id-2');

    it('e igual a si mesma', () => {
      expect(a.igualA(a)).toBe(true);
    });

    it('e igual a outra com o mesmo id', () => {
      expect(a.igualA(mesmaIdentidade)).toBe(true);
    });

    it('difere de outra com id diferente', () => {
      expect(a.igualA(outraIdentidade)).toBe(false);
    });

    it('difere de indefinido', () => {
      expect(a.igualA(undefined)).toBe(false);
    });
  });

  describe('ObjetoDeValor (igualdade por valor)', () => {
    it('difere de indefinido', () => {
      expect(Dinheiro.zero().igualA(undefined)).toBe(false);
    });
  });

  describe('RaizDeAgregado (eventos)', () => {
    it('acumula e limpa eventos de dominio', () => {
      const ordem = OrdemDeServico.criar({ clienteId: 'c', veiculoId: 'v' });
      expect(ordem.eventos.length).toBeGreaterThan(0);
      ordem.limparEventos();
      expect(ordem.eventos).toHaveLength(0);
    });
  });
});
