import { Inject, Injectable } from '@nestjs/common';
import { RecursoNaoEncontrado, RegraDeNegocioViolada } from '../../../shared/domain/excecoes';
import { UNIDADE_DE_TRABALHO, UnidadeDeTrabalho } from '../../../shared/application/unidade-de-trabalho';
import { OrdemDeServico } from '../domain/ordem-de-servico';
import {
  ORDEM_DE_SERVICO_REPOSITORY,
  OrdemDeServicoRepository,
} from '../domain/ordem-de-servico.repository';
import { CONSULTA_DE_CLIENTE, ConsultaDeCliente } from './ports/consulta-de-cliente';
import { CONSULTA_DE_VEICULO, ConsultaDeVeiculo } from './ports/consulta-de-veiculo';
import { OrdemDeServicoSaida, paraSaida } from './ordem-de-servico.saida';

export interface EntradaCriarOrdem {
  clienteId: string;
  veiculoId: string;
}

/**
 * Cria uma nova Ordem de Servico. Valida que o cliente e o veiculo existem e que
 * o veiculo pertence ao cliente informado antes de abrir a ordem no status
 * Recebida.
 */
@Injectable()
export class CriarOrdemDeServicoUseCase {
  constructor(
    @Inject(ORDEM_DE_SERVICO_REPOSITORY) private readonly ordens: OrdemDeServicoRepository,
    @Inject(CONSULTA_DE_CLIENTE) private readonly clientes: ConsultaDeCliente,
    @Inject(CONSULTA_DE_VEICULO) private readonly veiculos: ConsultaDeVeiculo,
    @Inject(UNIDADE_DE_TRABALHO) private readonly unidadeDeTrabalho: UnidadeDeTrabalho,
  ) {}

  public async executar(entrada: EntradaCriarOrdem): Promise<OrdemDeServicoSaida> {
    const cliente = await this.clientes.buscarPorId(entrada.clienteId);
    if (!cliente) {
      throw new RecursoNaoEncontrado('Cliente nao encontrado.');
    }

    const veiculo = await this.veiculos.buscarPorId(entrada.veiculoId);
    if (!veiculo) {
      throw new RecursoNaoEncontrado('Veiculo nao encontrado.');
    }

    if (veiculo.clienteId !== cliente.id) {
      throw new RegraDeNegocioViolada('O veiculo informado nao pertence ao cliente informado.');
    }

    const ordem = OrdemDeServico.criar({ clienteId: cliente.id, veiculoId: veiculo.id });

    await this.unidadeDeTrabalho.executar(() => this.ordens.salvar(ordem));

    return paraSaida(ordem);
  }
}
