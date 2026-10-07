import { Inject, Injectable } from '@nestjs/common';
import { RecursoNaoEncontrado } from '../../../shared/domain/excecoes';
import { PECA_REPOSITORY, PecaRepository } from '../../pecas/domain/peca.repository';
import {
  GestaoDeEstoque,
  ItemParaBaixa,
  PecaDoEstoque,
} from '../application/ports/gestao-de-estoque';

/**
 * Adaptador que satisfaz a porta GestaoDeEstoque delegando ao repositorio do
 * contexto de Pecas. A baixa de estoque usa o metodo de dominio da peca, que
 * garante a invariante de estoque nao negativo, e persiste cada alteracao na
 * transacao corrente aberta pela Unidade de Trabalho.
 */
@Injectable()
export class GestaoDeEstoqueAdapter implements GestaoDeEstoque {
  constructor(@Inject(PECA_REPOSITORY) private readonly pecas: PecaRepository) {}

  public async buscarPeca(id: string): Promise<PecaDoEstoque | null> {
    const peca = await this.pecas.buscarPorId(id);
    if (!peca) {
      return null;
    }
    return {
      id: peca.id,
      nome: peca.nome,
      valorCentavos: peca.precoUnitario.centavos,
      quantidadeDisponivel: peca.quantidadeEmEstoque,
    };
  }

  public async baixar(itens: ItemParaBaixa[]): Promise<void> {
    for (const item of itens) {
      // Leitura com bloqueio pessimista: a baixa ocorre dentro da transacao da
      // aprovacao, e o lock serializa baixas concorrentes do mesmo item.
      const peca = await this.pecas.buscarParaAtualizar(item.pecaId);
      if (!peca) {
        throw new RecursoNaoEncontrado(`Peca ${item.pecaId} nao encontrada.`);
      }
      peca.baixarEstoque(item.quantidade);
      await this.pecas.salvar(peca);
    }
  }
}
