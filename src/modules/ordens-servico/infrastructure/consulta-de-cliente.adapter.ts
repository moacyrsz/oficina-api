import { Inject, Injectable } from '@nestjs/common';
import { Cliente } from '../../clientes/domain/cliente';
import { CLIENTE_REPOSITORY, ClienteRepository } from '../../clientes/domain/cliente.repository';
import { Documento } from '../../clientes/domain/documento';
import { ClienteConsultado, ConsultaDeCliente } from '../application/ports/consulta-de-cliente';

/**
 * Adaptador que satisfaz a porta ConsultaDeCliente delegando ao repositorio do
 * contexto de Clientes. O documento e validado pelo objeto de valor do proprio
 * contexto de Clientes antes da busca.
 */
@Injectable()
export class ConsultaDeClienteAdapter implements ConsultaDeCliente {
  constructor(@Inject(CLIENTE_REPOSITORY) private readonly clientes: ClienteRepository) {}

  public async buscarPorId(id: string): Promise<ClienteConsultado | null> {
    const cliente = await this.clientes.buscarPorId(id);
    return cliente ? this.traduzir(cliente) : null;
  }

  public async buscarPorDocumento(documento: string): Promise<ClienteConsultado | null> {
    const documentoValido = Documento.criar(documento);
    const cliente = await this.clientes.buscarPorDocumento(documentoValido.valor);
    return cliente ? this.traduzir(cliente) : null;
  }

  private traduzir(cliente: Cliente): ClienteConsultado {
    return { id: cliente.id, nome: cliente.nome, documento: cliente.documento.valor };
  }
}
