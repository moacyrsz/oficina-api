import { UnidadeDeTrabalho } from '../../../shared/application/unidade-de-trabalho';
import { Dinheiro } from '../../../shared/domain/dinheiro';
import { RecursoNaoEncontrado } from '../../../shared/domain/excecoes';
import { Peca } from '../domain/peca';
import { PecaRepository } from '../domain/peca.repository';
import { AtualizarPecaUseCase } from './atualizar-peca.use-case';
import { ReporEstoqueUseCase } from './repor-estoque.use-case';

class UnidadeDeTrabalhoFake implements UnidadeDeTrabalho {
  public emTransacao = false;

  public async executar<T>(operacao: () => Promise<T>): Promise<T> {
    this.emTransacao = true;
    try {
      return await operacao();
    } finally {
      this.emTransacao = false;
    }
  }
}

class RepositorioDePecasEmMemoria implements PecaRepository {
  public readonly dados = new Map<string, Peca>();
  public readonly leiturasComBloqueio: string[] = [];

  constructor(private readonly unidadeDeTrabalho: UnidadeDeTrabalhoFake) {}

  public async salvar(peca: Peca): Promise<void> {
    this.dados.set(peca.id, peca);
  }

  public async buscarPorId(id: string): Promise<Peca | null> {
    return this.dados.get(id) ?? null;
  }

  public async buscarParaAtualizar(id: string): Promise<Peca | null> {
    if (!this.unidadeDeTrabalho.emTransacao) {
      throw new Error('O bloqueio da peca exige uma transacao ativa.');
    }
    this.leiturasComBloqueio.push(id);
    return this.dados.get(id) ?? null;
  }

  public async listar(): Promise<Peca[]> {
    return [...this.dados.values()];
  }

  public async remover(id: string): Promise<void> {
    this.dados.delete(id);
  }
}

async function montarCenario() {
  const unidadeDeTrabalho = new UnidadeDeTrabalhoFake();
  const pecas = new RepositorioDePecasEmMemoria(unidadeDeTrabalho);
  const peca = Peca.criar({
    nome: 'Filtro de oleo',
    precoUnitario: Dinheiro.deReais(40),
    quantidadeEmEstoque: 10,
  });
  await pecas.salvar(peca);
  return { unidadeDeTrabalho, pecas, peca };
}

describe('Movimentacao de estoque de pecas', () => {
  it('repoe o estoque lendo a peca com bloqueio dentro da transacao', async () => {
    const { unidadeDeTrabalho, pecas, peca } = await montarCenario();

    const saida = await new ReporEstoqueUseCase(pecas, unidadeDeTrabalho).executar({
      id: peca.id,
      quantidade: 5,
    });

    expect(saida.quantidadeEmEstoque).toBe(15);
    expect(pecas.leiturasComBloqueio).toEqual([peca.id]);
  });

  it('atualiza o preco lendo a peca com bloqueio e preserva o estoque', async () => {
    const { unidadeDeTrabalho, pecas, peca } = await montarCenario();

    const saida = await new AtualizarPecaUseCase(pecas, unidadeDeTrabalho).executar({
      id: peca.id,
      precoUnitario: 45,
    });

    expect(saida.precoUnitario).toBe(45);
    expect(saida.quantidadeEmEstoque).toBe(10);
    expect(pecas.leiturasComBloqueio).toEqual([peca.id]);
  });

  it('retorna 404 ao repor estoque de peca inexistente', async () => {
    const { unidadeDeTrabalho, pecas } = await montarCenario();

    await expect(
      new ReporEstoqueUseCase(pecas, unidadeDeTrabalho).executar({
        id: 'inexistente',
        quantidade: 1,
      }),
    ).rejects.toBeInstanceOf(RecursoNaoEncontrado);
  });
});
