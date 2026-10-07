import { Inject, Injectable } from '@nestjs/common';
import { RecursoNaoEncontrado } from '../../../shared/domain/excecoes';
import { VEICULO_REPOSITORY, VeiculoRepository } from '../domain/veiculo.repository';

/**
 * Remove um veiculo do cadastro. Falha com 404 quando o veiculo nao existe.
 */
@Injectable()
export class RemoverVeiculoUseCase {
  constructor(@Inject(VEICULO_REPOSITORY) private readonly veiculos: VeiculoRepository) {}

  public async executar(id: string): Promise<void> {
    const veiculo = await this.veiculos.buscarPorId(id);
    if (!veiculo) {
      throw new RecursoNaoEncontrado('Veiculo nao encontrado.');
    }

    await this.veiculos.remover(id);
  }
}
