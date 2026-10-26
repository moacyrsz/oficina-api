import { Dinheiro } from '../../../shared/domain/dinheiro';
import { Peca } from '../../pecas/domain/peca';
import { PecaRepository } from '../../pecas/domain/peca.repository';
import { GestaoDeEstoqueAdapter } from './gestao-de-estoque.adapter';

class RepositorioDePecasEmMemoria implements PecaRepository {
  public readonly dados = new Map<string, Peca>();
  public readonly ordemDosBloqueios: string[] = [];

  public async salvar(peca: Peca): Promise<void> {
    this.dados.set(peca.id, peca);
  }

  public async buscarPorId(id: string): Promise<Peca | null> {
    return this.dados.get(id) ?? null;
  }

  public async buscarParaAtualizar(id: string): Promise<Peca | null> {
    this.ordemDosBloqueios.push(id);
    return this.dados.get(id) ?? null;
  }

  public async listar(): Promise<Peca[]> {
    return [...this.dados.values()];
  }

  public async remover(id: string): Promise<void> {
    this.dados.delete(id);
  }
}

function peca(id: string, quantidadeEmEstoque: number): Peca {
  return Peca.criar(
    { nome: `Peca ${id}`, precoUnitario: Dinheiro.deReais(10), quantidadeEmEstoque },
    id,
  );
}

describe('GestaoDeEstoqueAdapter', () => {
  it('bloqueia as pecas sempre na mesma ordem e uma unica vez por peca', async () => {
    const pecas = new RepositorioDePecasEmMemoria();
    await pecas.salvar(peca('b-peca', 10));
    await pecas.salvar(peca('a-peca', 10));

    await new GestaoDeEstoqueAdapter(pecas).baixar([
      { pecaId: 'b-peca', quantidade: 1 },
      { pecaId: 'a-peca', quantidade: 2 },
      { pecaId: 'b-peca', quantidade: 3 },
    ]);

    expect(pecas.ordemDosBloqueios).toEqual(['a-peca', 'b-peca']);
    expect(pecas.dados.get('a-peca')?.quantidadeEmEstoque).toBe(8);
    expect(pecas.dados.get('b-peca')?.quantidadeEmEstoque).toBe(6);
  });
});
