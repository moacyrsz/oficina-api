import { Inject, Injectable } from '@nestjs/common';
import { RecursoNaoEncontrado } from '../../../shared/domain/excecoes';
import { PECA_REPOSITORY, PecaRepository } from '../domain/peca.repository';

/**
 * Remove uma peca do catalogo. Falha com recurso nao encontrado quando o id
 * informado nao corresponde a nenhuma peca.
 */
@Injectable()
export class RemoverPecaUseCase {
  constructor(@Inject(PECA_REPOSITORY) private readonly pecas: PecaRepository) {}

  public async executar(id: string): Promise<void> {
    const peca = await this.pecas.buscarPorId(id);
    if (!peca) {
      throw new RecursoNaoEncontrado('Peca nao encontrada.');
    }

    await this.pecas.remover(id);
  }
}
