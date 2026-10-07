import { Inject, Injectable } from '@nestjs/common';
import { RecursoNaoEncontrado } from '../../../shared/domain/excecoes';
import { SERVICO_REPOSITORY, ServicoRepository } from '../domain/servico.repository';

/**
 * Remove um servico do catalogo. Falha com 404 se o servico nao existir.
 */
@Injectable()
export class RemoverServicoUseCase {
  constructor(@Inject(SERVICO_REPOSITORY) private readonly servicos: ServicoRepository) {}

  public async executar(id: string): Promise<void> {
    const servico = await this.servicos.buscarPorId(id);
    if (!servico) {
      throw new RecursoNaoEncontrado('Servico nao encontrado.');
    }

    await this.servicos.remover(id);
  }
}
