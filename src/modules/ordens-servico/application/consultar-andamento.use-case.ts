import { Inject, Injectable } from '@nestjs/common';
import { StatusOrdemServico } from '../domain/status-ordem-servico';
import { DecisaoOrcamento } from '../domain/aprovacao';
import { LocalizadorDeOrdemDoCliente } from './localizador-de-ordem-do-cliente';
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

/**
 * Consulta publica do andamento de uma ordem de servico. O cliente informa o
 * codigo da ordem e o seu documento (CPF ou CNPJ); a verificacao fica no
 * LocalizadorDeOrdemDoCliente.
 */
@Injectable()
export class ConsultarAndamentoUseCase {
  constructor(
    private readonly localizador: LocalizadorDeOrdemDoCliente,
    @Inject(CONSULTA_DE_VEICULO) private readonly veiculos: ConsultaDeVeiculo,
  ) {}

  public async executar(entrada: EntradaConsultarAndamento): Promise<AndamentoDaOrdem> {
    const ordem = await this.localizador.localizar(entrada.codigo, entrada.documento);
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
