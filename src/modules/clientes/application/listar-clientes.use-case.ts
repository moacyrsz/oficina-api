import { Inject, Injectable } from '@nestjs/common';
import { CLIENTE_REPOSITORY, ClienteRepository } from '../domain/cliente.repository';
import { ClienteSaida, paraSaida } from './cliente.saida';

/**
 * Lista todos os clientes cadastrados.
 */
@Injectable()
export class ListarClientesUseCase {
  constructor(@Inject(CLIENTE_REPOSITORY) private readonly clientes: ClienteRepository) {}

  public async executar(): Promise<ClienteSaida[]> {
    const clientes = await this.clientes.listar();
    return clientes.map((cliente) => paraSaida(cliente));
  }
}
