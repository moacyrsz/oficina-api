import { Inject, Injectable } from '@nestjs/common';
import { RecursoNaoEncontrado } from '../../../shared/domain/excecoes';
import { CLIENTE_REPOSITORY, ClienteRepository } from '../domain/cliente.repository';
import { ClienteSaida, paraSaida } from './cliente.saida';

/**
 * Retorna os dados de um cliente pelo seu id. Falha com 404 caso nao exista.
 */
@Injectable()
export class BuscarClienteUseCase {
  constructor(@Inject(CLIENTE_REPOSITORY) private readonly clientes: ClienteRepository) {}

  public async executar(id: string): Promise<ClienteSaida> {
    const cliente = await this.clientes.buscarPorId(id);
    if (!cliente) {
      throw new RecursoNaoEncontrado('Cliente nao encontrado.');
    }

    return paraSaida(cliente);
  }
}
