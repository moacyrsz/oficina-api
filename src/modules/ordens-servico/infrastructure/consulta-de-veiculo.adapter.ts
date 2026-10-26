import { Inject, Injectable } from '@nestjs/common';
import { Placa } from '../../veiculos/domain/placa';
import { Veiculo } from '../../veiculos/domain/veiculo';
import { VEICULO_REPOSITORY, VeiculoRepository } from '../../veiculos/domain/veiculo.repository';
import { ConsultaDeVeiculo, VeiculoConsultado } from '../application/ports/consulta-de-veiculo';

/**
 * Adaptador que satisfaz a porta ConsultaDeVeiculo delegando ao repositorio do
 * contexto de Veiculos. A placa e validada pelo objeto de valor do proprio
 * contexto de Veiculos antes da busca.
 */
@Injectable()
export class ConsultaDeVeiculoAdapter implements ConsultaDeVeiculo {
  constructor(@Inject(VEICULO_REPOSITORY) private readonly veiculos: VeiculoRepository) {}

  public async buscarPorId(id: string): Promise<VeiculoConsultado | null> {
    const veiculo = await this.veiculos.buscarPorId(id);
    return veiculo ? this.traduzir(veiculo) : null;
  }

  public async buscarPorPlaca(placa: string): Promise<VeiculoConsultado | null> {
    const placaValida = Placa.criar(placa);
    const veiculo = await this.veiculos.buscarPorPlaca(placaValida.valor);
    return veiculo ? this.traduzir(veiculo) : null;
  }

  private traduzir(veiculo: Veiculo): VeiculoConsultado {
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
