import { Inject, Injectable } from '@nestjs/common';
import { RecursoNaoEncontrado } from '../../../shared/domain/excecoes';
import { VEICULO_REPOSITORY, VeiculoRepository } from '../domain/veiculo.repository';
import { VeiculoSaida, paraSaida } from './veiculo.saida';

export interface EntradaAtualizarVeiculo {
  marca?: string;
  modelo?: string;
  ano?: number;
}

/**
 * Atualiza os dados cadastrais de um veiculo existente.
 */
@Injectable()
export class AtualizarVeiculoUseCase {
  constructor(@Inject(VEICULO_REPOSITORY) private readonly veiculos: VeiculoRepository) {}

  public async executar(id: string, entrada: EntradaAtualizarVeiculo): Promise<VeiculoSaida> {
    const veiculo = await this.veiculos.buscarPorId(id);
    if (!veiculo) {
      throw new RecursoNaoEncontrado('Veiculo nao encontrado.');
    }

    veiculo.atualizar({ marca: entrada.marca, modelo: entrada.modelo, ano: entrada.ano });

    await this.veiculos.salvar(veiculo);

    return paraSaida(veiculo);
  }
}
