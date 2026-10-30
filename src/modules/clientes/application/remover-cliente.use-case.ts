import { Inject, Injectable } from '@nestjs/common';
import { ConflitoDeRecurso, RecursoNaoEncontrado } from '../../../shared/domain/excecoes';
import { CLIENTE_REPOSITORY, ClienteRepository } from '../domain/cliente.repository';
import { VINCULOS_DO_CLIENTE, VinculosDoCliente } from './ports/vinculos-do-cliente';

/**
 * Remove um cliente sem vinculos. Clientes com ordens de servico nunca sao
 * removidos, para preservar o historico de atendimento; clientes com veiculos
 * exigem a remocao dos veiculos antes.
 */
@Injectable()
export class RemoverClienteUseCase {
  constructor(
    @Inject(CLIENTE_REPOSITORY) private readonly clientes: ClienteRepository,
    @Inject(VINCULOS_DO_CLIENTE) private readonly vinculos: VinculosDoCliente,
  ) {}

  public async executar(id: string): Promise<void> {
    const cliente = await this.clientes.buscarPorId(id);
    if (!cliente) {
      throw new RecursoNaoEncontrado('Cliente nao encontrado.');
    }

    if (await this.vinculos.possuiOrdensDeServico(id)) {
      throw new ConflitoDeRecurso(
        'O cliente possui ordens de servico e nao pode ser removido, para preservar o historico.',
      );
    }
    if (await this.vinculos.possuiVeiculos(id)) {
      throw new ConflitoDeRecurso(
        'O cliente possui veiculos cadastrados. Remova os veiculos antes de remover o cliente.',
      );
    }

    await this.clientes.remover(id);
  }
}
