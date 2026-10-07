import { Inject, Injectable } from '@nestjs/common';
import { RecursoNaoEncontrado } from '../../../shared/domain/excecoes';
import { CLIENTE_REPOSITORY, ClienteRepository } from '../domain/cliente.repository';
import { ClienteSaida, paraSaida } from './cliente.saida';

export interface EntradaAtualizarCliente {
  nome?: string;
  email?: string;
  telefone?: string;
}

/**
 * Atualiza os dados cadastrais mutaveis de um cliente existente. O documento
 * fiscal nao e alterado por esta operacao.
 */
@Injectable()
export class AtualizarClienteUseCase {
  constructor(@Inject(CLIENTE_REPOSITORY) private readonly clientes: ClienteRepository) {}

  public async executar(id: string, entrada: EntradaAtualizarCliente): Promise<ClienteSaida> {
    const cliente = await this.clientes.buscarPorId(id);
    if (!cliente) {
      throw new RecursoNaoEncontrado('Cliente nao encontrado.');
    }

    cliente.atualizar({
      nome: entrada.nome,
      email: entrada.email,
      telefone: entrada.telefone,
    });

    await this.clientes.salvar(cliente);

    return paraSaida(cliente);
  }
}
