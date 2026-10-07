import { Inject, Injectable } from '@nestjs/common';
import { RecursoNaoEncontrado } from '../../../shared/domain/excecoes';
import { CLIENTE_REPOSITORY, ClienteRepository } from '../domain/cliente.repository';

/**
 * Remove um cliente existente. Falha com 404 caso o cliente nao exista.
 */
@Injectable()
export class RemoverClienteUseCase {
  constructor(@Inject(CLIENTE_REPOSITORY) private readonly clientes: ClienteRepository) {}

  public async executar(id: string): Promise<void> {
    const cliente = await this.clientes.buscarPorId(id);
    if (!cliente) {
      throw new RecursoNaoEncontrado('Cliente nao encontrado.');
    }

    await this.clientes.remover(id);
  }
}
