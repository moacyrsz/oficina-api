import { Inject, Injectable } from '@nestjs/common';
import {
  FiltroDeOrdens,
  ORDEM_DE_SERVICO_REPOSITORY,
  OrdemDeServicoRepository,
} from '../domain/ordem-de-servico.repository';
import { OrdemDeServicoSaida, paraSaida } from './ordem-de-servico.saida';

/**
 * Lista as ordens de servico, com filtro opcional por status.
 */
@Injectable()
export class ListarOrdensUseCase {
  constructor(
    @Inject(ORDEM_DE_SERVICO_REPOSITORY) private readonly ordens: OrdemDeServicoRepository,
  ) {}

  public async executar(filtro?: FiltroDeOrdens): Promise<OrdemDeServicoSaida[]> {
    const ordens = await this.ordens.listar(filtro);
    return ordens.map(paraSaida);
  }
}
