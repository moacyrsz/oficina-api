import { Inject, Injectable } from '@nestjs/common';
import { RecursoNaoEncontrado } from '../../../shared/domain/excecoes';
import {
  ORDEM_DE_SERVICO_REPOSITORY,
  OrdemDeServicoRepository,
} from '../domain/ordem-de-servico.repository';
import { StatusOrdemServico } from '../domain/status-ordem-servico';
import { DecisaoOrcamento } from '../domain/aprovacao';
import { CONSULTA_DE_CLIENTE, ConsultaDeCliente } from './ports/consulta-de-cliente';
import { CONSULTA_DE_VEICULO, ConsultaDeVeiculo } from './ports/consulta-de-veiculo';

export interface EntradaConsultarAndamento {
  codigo: string;
  documento: string;
}

export interface AndamentoDaOrdem {
  codigo: string;
  status: StatusOrdemServico;
  veiculo: string | null;
  valorTotalOrcamento: number;
  decisaoOrcamento: DecisaoOrcamento | null;
  historico: { status: StatusOrdemServico; em: string }[];
  criadaEm: string;
  finalizadaEm: string | null;
  entregueEm: string | null;
}

function apenasDigitos(valor: string): string {
  return (valor ?? '').replace(/\D/g, '');
}

/**
 * Consulta publica do andamento de uma ordem de servico. O cliente informa o
 * codigo da ordem e o seu documento (CPF ou CNPJ). O documento funciona como
 * fator de verificacao: so retorna os dados se corresponder ao cliente da ordem.
 */
@Injectable()
export class ConsultarAndamentoUseCase {
  constructor(
    @Inject(ORDEM_DE_SERVICO_REPOSITORY) private readonly ordens: OrdemDeServicoRepository,
    @Inject(CONSULTA_DE_CLIENTE) private readonly clientes: ConsultaDeCliente,
    @Inject(CONSULTA_DE_VEICULO) private readonly veiculos: ConsultaDeVeiculo,
  ) {}

  public async executar(entrada: EntradaConsultarAndamento): Promise<AndamentoDaOrdem> {
    // Resposta unica para "nao encontrada" e "documento invalido". Diferenciar
    // os dois casos permitiria enumerar codigos de ordens validos (oraculo).
    const naoEncontradaOuInvalida = () =>
      new RecursoNaoEncontrado('Ordem de servico nao encontrada ou documento invalido.');

    const codigo = (entrada.codigo ?? '').trim().toUpperCase();
    const ordem = await this.ordens.buscarPorCodigo(codigo);
    if (!ordem) {
      throw naoEncontradaOuInvalida();
    }

    const cliente = await this.clientes.buscarPorId(ordem.clienteId);
    if (!cliente || apenasDigitos(cliente.documento) !== apenasDigitos(entrada.documento)) {
      throw naoEncontradaOuInvalida();
    }

    const veiculo = await this.veiculos.buscarPorId(ordem.veiculoId);

    return {
      codigo: ordem.codigo,
      status: ordem.status,
      veiculo: veiculo ? `${veiculo.marca} ${veiculo.modelo} - ${veiculo.placa}` : null,
      valorTotalOrcamento: ordem.calcularOrcamento().valorTotal.reais,
      decisaoOrcamento: ordem.aprovacao ? ordem.aprovacao.decisao : null,
      historico: ordem.historico.map((registro) => ({
        status: registro.status,
        em: registro.em.toISOString(),
      })),
      criadaEm: ordem.criadaEm.toISOString(),
      finalizadaEm: ordem.finalizadaEm ? ordem.finalizadaEm.toISOString() : null,
      entregueEm: ordem.entregueEm ? ordem.entregueEm.toISOString() : null,
    };
  }
}
