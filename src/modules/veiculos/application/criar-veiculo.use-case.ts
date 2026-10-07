import { Inject, Injectable } from '@nestjs/common';
import { ConflitoDeRecurso, RecursoNaoEncontrado } from '../../../shared/domain/excecoes';
import { CLIENTE_REPOSITORY, ClienteRepository } from '../../clientes/domain/cliente.repository';
import { Placa } from '../domain/placa';
import { Veiculo } from '../domain/veiculo';
import { VEICULO_REPOSITORY, VeiculoRepository } from '../domain/veiculo.repository';
import { VeiculoSaida, paraSaida } from './veiculo.saida';

export interface EntradaCriarVeiculo {
  placa: Placa;
  marca: string;
  modelo: string;
  ano: number;
  clienteId: string;
}

/**
 * Cadastra um novo veiculo. Valida que o cliente proprietario existe e que a
 * placa informada ainda nao esta em uso por outro veiculo.
 */
@Injectable()
export class CriarVeiculoUseCase {
  constructor(
    @Inject(VEICULO_REPOSITORY) private readonly veiculos: VeiculoRepository,
    @Inject(CLIENTE_REPOSITORY) private readonly clientes: ClienteRepository,
  ) {}

  public async executar(entrada: EntradaCriarVeiculo): Promise<VeiculoSaida> {
    const cliente = await this.clientes.buscarPorId(entrada.clienteId);
    if (!cliente) {
      throw new RecursoNaoEncontrado('Cliente nao encontrado.');
    }

    const existente = await this.veiculos.buscarPorPlaca(entrada.placa.valor);
    if (existente) {
      throw new ConflitoDeRecurso('Ja existe um veiculo cadastrado com a placa informada.');
    }

    const veiculo = Veiculo.criar({
      placa: entrada.placa,
      marca: entrada.marca,
      modelo: entrada.modelo,
      ano: entrada.ano,
      clienteId: entrada.clienteId,
    });

    await this.veiculos.salvar(veiculo);

    return paraSaida(veiculo);
  }
}
