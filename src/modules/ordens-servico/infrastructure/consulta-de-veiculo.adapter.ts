import { Inject, Injectable } from '@nestjs/common';
import { VEICULO_REPOSITORY, VeiculoRepository } from '../../veiculos/domain/veiculo.repository';
import { ConsultaDeVeiculo, VeiculoConsultado } from '../application/ports/consulta-de-veiculo';

/**
 * Adaptador que satisfaz a porta ConsultaDeVeiculo delegando ao repositorio do
 * contexto de Veiculos.
 */
@Injectable()
export class ConsultaDeVeiculoAdapter implements ConsultaDeVeiculo {
  constructor(@Inject(VEICULO_REPOSITORY) private readonly veiculos: VeiculoRepository) {}

  public async buscarPorId(id: string): Promise<VeiculoConsultado | null> {
    const veiculo = await this.veiculos.buscarPorId(id);
    if (!veiculo) {
      return null;
    }
    return {
      id: veiculo.id,
      clienteId: veiculo.clienteId,
      placa: veiculo.placa.valor,
      marca: veiculo.marca,
      modelo: veiculo.modelo,
      ano: veiculo.ano,
    };
  }
}
