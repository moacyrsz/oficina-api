import { Inject, Injectable } from '@nestjs/common';
import { RecursoNaoEncontrado } from '../../../shared/domain/excecoes';
import { PECA_REPOSITORY, PecaRepository } from '../domain/peca.repository';
import { PecaSaida, paraSaida } from './peca.saida';

export interface EntradaReporEstoque {
  id: string;
  quantidade: number;
}

/**
 * Repoe o estoque de uma peca, somando a quantidade informada ao saldo atual.
 */
@Injectable()
export class ReporEstoqueUseCase {
  constructor(@Inject(PECA_REPOSITORY) private readonly pecas: PecaRepository) {}

  public async executar(entrada: EntradaReporEstoque): Promise<PecaSaida> {
    const peca = await this.pecas.buscarPorId(entrada.id);
    if (!peca) {
      throw new RecursoNaoEncontrado('Peca nao encontrada.');
    }

    peca.reporEstoque(entrada.quantidade);

    await this.pecas.salvar(peca);

    return paraSaida(peca);
  }
}
