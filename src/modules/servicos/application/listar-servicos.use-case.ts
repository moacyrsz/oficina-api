import { Inject, Injectable } from '@nestjs/common';
import { SERVICO_REPOSITORY, ServicoRepository } from '../domain/servico.repository';
import { ServicoSaida, paraSaida } from './servico.saida';

/**
 * Lista todos os servicos cadastrados no catalogo.
 */
@Injectable()
export class ListarServicosUseCase {
  constructor(@Inject(SERVICO_REPOSITORY) private readonly servicos: ServicoRepository) {}

  public async executar(): Promise<ServicoSaida[]> {
    const servicos = await this.servicos.listar();
    return servicos.map(paraSaida);
  }
}
