import { Inject, Injectable } from '@nestjs/common';
import { CLIENTE_REPOSITORY, ClienteRepository } from '../../clientes/domain/cliente.repository';
import { ClienteConsultado, ConsultaDeCliente } from '../application/ports/consulta-de-cliente';

/**
 * Adaptador que satisfaz a porta ConsultaDeCliente delegando ao repositorio do
 * contexto de Clientes.
 */
@Injectable()
export class ConsultaDeClienteAdapter implements ConsultaDeCliente {
  constructor(@Inject(CLIENTE_REPOSITORY) private readonly clientes: ClienteRepository) {}

  public async buscarPorId(id: string): Promise<ClienteConsultado | null> {
    const cliente = await this.clientes.buscarPorId(id);
    if (!cliente) {
      return null;
    }
    return { id: cliente.id, nome: cliente.nome, documento: cliente.documento.valor };
  }
}
