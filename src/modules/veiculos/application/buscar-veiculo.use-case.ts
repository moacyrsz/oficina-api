import { Inject, Injectable } from '@nestjs/common';
import { RecursoNaoEncontrado } from '../../../shared/domain/excecoes';
import { VEICULO_REPOSITORY, VeiculoRepository } from '../domain/veiculo.repository';
import { VeiculoSaida, paraSaida } from './veiculo.saida';

/**
 * Retorna o detalhamento de um veiculo pelo seu id.
 */
@Injectable()
export class BuscarVeiculoUseCase {
  constructor(@Inject(VEICULO_REPOSITORY) private readonly veiculos: VeiculoRepository) {}

  public async executar(id: string): Promise<VeiculoSaida> {
    const veiculo = await this.veiculos.buscarPorId(id);
    if (!veiculo) {
      throw new RecursoNaoEncontrado('Veiculo nao encontrado.');
    }

    return paraSaida(veiculo);
  }
}
