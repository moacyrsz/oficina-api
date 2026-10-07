import { Inject, Injectable } from '@nestjs/common';
import { RecursoNaoEncontrado } from '../../../shared/domain/excecoes';
import {
  ORDEM_DE_SERVICO_REPOSITORY,
  OrdemDeServicoRepository,
} from '../domain/ordem-de-servico.repository';
import { OrdemDeServicoSaida, paraSaida } from './ordem-de-servico.saida';

/**
 * Retorna o detalhamento completo de uma ordem de servico pelo seu id.
 */
@Injectable()
export class DetalharOrdemUseCase {
  constructor(
    @Inject(ORDEM_DE_SERVICO_REPOSITORY) private readonly ordens: OrdemDeServicoRepository,
  ) {}

  public async executar(ordemId: string): Promise<OrdemDeServicoSaida> {
    const ordem = await this.ordens.buscarPorId(ordemId);
    if (!ordem) {
      throw new RecursoNaoEncontrado('Ordem de servico nao encontrada.');
    }
    return paraSaida(ordem);
  }
}
