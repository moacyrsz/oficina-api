import { Inject, Injectable } from '@nestjs/common';
import { ConflitoDeRecurso } from '../../../shared/domain/excecoes';
import { Cliente } from '../domain/cliente';
import { CLIENTE_REPOSITORY, ClienteRepository } from '../domain/cliente.repository';
import { Documento } from '../domain/documento';
import { ClienteSaida, paraSaida } from './cliente.saida';

export interface EntradaCriarCliente {
  nome: string;
  documento: string;
  email: string;
  telefone: string;
}

/**
 * Cadastra um novo cliente. O documento e validado pelo objeto de valor e sua
 * unicidade e verificada antes de persistir, impedindo cadastros duplicados.
 */
@Injectable()
export class CriarClienteUseCase {
  constructor(@Inject(CLIENTE_REPOSITORY) private readonly clientes: ClienteRepository) {}

  public async executar(entrada: EntradaCriarCliente): Promise<ClienteSaida> {
    const documento = Documento.criar(entrada.documento);

    const existente = await this.clientes.buscarPorDocumento(documento.valor);
    if (existente) {
      throw new ConflitoDeRecurso('Ja existe um cliente cadastrado com este documento.');
    }

    const cliente = Cliente.criar({
      nome: entrada.nome,
      documento,
      email: entrada.email,
      telefone: entrada.telefone,
    });

    await this.clientes.salvar(cliente);

    return paraSaida(cliente);
  }
}
