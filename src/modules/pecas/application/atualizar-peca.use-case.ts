import { Inject, Injectable } from '@nestjs/common';
import { Dinheiro } from '../../../shared/domain/dinheiro';
import { RecursoNaoEncontrado } from '../../../shared/domain/excecoes';
import { PECA_REPOSITORY, PecaRepository } from '../domain/peca.repository';
import { PecaSaida, paraSaida } from './peca.saida';

export interface EntradaAtualizarPeca {
  id: string;
  nome?: string;
  descricao?: string;
  precoUnitario?: number;
}

/**
 * Atualiza os dados cadastrais de uma peca (nome, descricao e preco). O estoque
 * nao e alterado por este caso de uso: movimentacoes de quantidade acontecem
 * pela reposicao e pela baixa na ordem de servico.
 */
@Injectable()
export class AtualizarPecaUseCase {
  constructor(@Inject(PECA_REPOSITORY) private readonly pecas: PecaRepository) {}

  public async executar(entrada: EntradaAtualizarPeca): Promise<PecaSaida> {
    const peca = await this.pecas.buscarPorId(entrada.id);
    if (!peca) {
      throw new RecursoNaoEncontrado('Peca nao encontrada.');
    }

    peca.atualizar({
      nome: entrada.nome,
      descricao: entrada.descricao,
      precoUnitario:
        entrada.precoUnitario !== undefined
          ? Dinheiro.deReais(entrada.precoUnitario)
          : undefined,
    });

    await this.pecas.salvar(peca);

    return paraSaida(peca);
  }
}
