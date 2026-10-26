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
    const quantidadePorPeca = new Map<string, number>();
    for (const item of itens) {
      quantidadePorPeca.set(
        item.pecaId,
        (quantidadePorPeca.get(item.pecaId) ?? 0) + item.quantidade,
      );
    }

    // As pecas sao bloqueadas sempre na mesma ordem (por id): duas aprovacoes
    // com pecas em comum nunca ficam esperando uma pela outra (deadlock).
    const pecaIds = [...quantidadePorPeca.keys()].sort();
    for (const pecaId of pecaIds) {
      const peca = await this.pecas.buscarParaAtualizar(pecaId);
      if (!peca) {
        throw new RecursoNaoEncontrado(`Peca ${pecaId} nao encontrada.`);
      }
      peca.baixarEstoque(quantidadePorPeca.get(pecaId) as number);
      await this.pecas.salvar(peca);
    }
  }
}
