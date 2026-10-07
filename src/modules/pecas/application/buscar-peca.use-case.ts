import { Inject, Injectable } from '@nestjs/common';
import { RecursoNaoEncontrado } from '../../../shared/domain/excecoes';
import { PECA_REPOSITORY, PecaRepository } from '../domain/peca.repository';
import { PecaSaida, paraSaida } from './peca.saida';

/**
 * Retorna os dados de uma peca pelo seu id.
 */
@Injectable()
export class BuscarPecaUseCase {
  constructor(@Inject(PECA_REPOSITORY) private readonly pecas: PecaRepository) {}

  public async executar(id: string): Promise<PecaSaida> {
    const peca = await this.pecas.buscarPorId(id);
    if (!peca) {
      throw new RecursoNaoEncontrado('Peca nao encontrada.');
    }

    return paraSaida(peca);
  }
}
