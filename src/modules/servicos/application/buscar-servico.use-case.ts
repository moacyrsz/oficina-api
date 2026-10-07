import { Inject, Injectable } from '@nestjs/common';
import { RecursoNaoEncontrado } from '../../../shared/domain/excecoes';
import { SERVICO_REPOSITORY, ServicoRepository } from '../domain/servico.repository';
import { ServicoSaida, paraSaida } from './servico.saida';

/**
 * Retorna um servico pelo seu id. Falha com 404 se o servico nao existir.
 */
@Injectable()
export class BuscarServicoUseCase {
  constructor(@Inject(SERVICO_REPOSITORY) private readonly servicos: ServicoRepository) {}

  public async executar(id: string): Promise<ServicoSaida> {
    const servico = await this.servicos.buscarPorId(id);
    if (!servico) {
      throw new RecursoNaoEncontrado('Servico nao encontrado.');
    }

    return paraSaida(servico);
  }
}
