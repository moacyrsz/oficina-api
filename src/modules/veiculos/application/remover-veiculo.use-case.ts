import { Inject, Injectable } from '@nestjs/common';
import { ConflitoDeRecurso, RecursoNaoEncontrado } from '../../../shared/domain/excecoes';
import { VEICULO_REPOSITORY, VeiculoRepository } from '../domain/veiculo.repository';
import { VINCULOS_DO_VEICULO, VinculosDoVeiculo } from './ports/vinculos-do-veiculo';

/**
 * Remove um veiculo do cadastro. Veiculos com ordens de servico nunca sao
 * removidos, para preservar o historico de atendimento.
 */
@Injectable()
export class RemoverVeiculoUseCase {
  constructor(
    @Inject(VEICULO_REPOSITORY) private readonly veiculos: VeiculoRepository,
    @Inject(VINCULOS_DO_VEICULO) private readonly vinculos: VinculosDoVeiculo,
  ) {}

  public async executar(id: string): Promise<void> {
    const veiculo = await this.veiculos.buscarPorId(id);
    if (!veiculo) {
      throw new RecursoNaoEncontrado('Veiculo nao encontrado.');
    }

    if (await this.vinculos.possuiOrdensDeServico(id)) {
      throw new ConflitoDeRecurso(
        'O veiculo possui ordens de servico e nao pode ser removido, para preservar o historico.',
      );
    }

    await this.veiculos.remover(id);
  }
}
