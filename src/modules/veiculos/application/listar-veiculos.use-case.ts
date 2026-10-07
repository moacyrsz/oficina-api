import { Inject, Injectable } from '@nestjs/common';
import { VEICULO_REPOSITORY, VeiculoRepository } from '../domain/veiculo.repository';
import { VeiculoSaida, paraSaida } from './veiculo.saida';

/**
 * Lista todos os veiculos cadastrados.
 */
@Injectable()
export class ListarVeiculosUseCase {
  constructor(@Inject(VEICULO_REPOSITORY) private readonly veiculos: VeiculoRepository) {}

  public async executar(): Promise<VeiculoSaida[]> {
    const veiculos = await this.veiculos.listar();
    return veiculos.map(paraSaida);
  }
}
