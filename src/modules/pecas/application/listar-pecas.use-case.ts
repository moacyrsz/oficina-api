import { Inject, Injectable } from '@nestjs/common';
import { PECA_REPOSITORY, PecaRepository } from '../domain/peca.repository';
import { PecaSaida, paraSaida } from './peca.saida';

/**
 * Lista todas as pecas cadastradas no catalogo.
 */
@Injectable()
export class ListarPecasUseCase {
  constructor(@Inject(PECA_REPOSITORY) private readonly pecas: PecaRepository) {}

  public async executar(): Promise<PecaSaida[]> {
    const pecas = await this.pecas.listar();
    return pecas.map(paraSaida);
  }
}
