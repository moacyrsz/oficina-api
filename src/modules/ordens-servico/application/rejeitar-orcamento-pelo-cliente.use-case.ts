import { Injectable } from '@nestjs/common';
import {
  AndamentoDaOrdem,
  ConsultarAndamentoUseCase,
  EntradaConsultarAndamento,
} from './consultar-andamento.use-case';
import { LocalizadorDeOrdemDoCliente } from './localizador-de-ordem-do-cliente';
import { RejeitarOrcamentoUseCase } from './rejeitar-orcamento.use-case';

export interface EntradaRejeitarPeloCliente extends EntradaConsultarAndamento {
  motivo?: string;
}

/**
 * Rejeicao do orcamento feita pelo proprio cliente, na API publica. Depois de
 * conferir o codigo da ordem e o documento, registra a rejeicao e a ordem volta
 * para "Em diagnostico".
 */
@Injectable()
export class RejeitarOrcamentoPeloClienteUseCase {
  constructor(
    private readonly localizador: LocalizadorDeOrdemDoCliente,
    private readonly rejeitarOrcamento: RejeitarOrcamentoUseCase,
    private readonly consultarAndamento: ConsultarAndamentoUseCase,
  ) {}

  public async executar(entrada: EntradaRejeitarPeloCliente): Promise<AndamentoDaOrdem> {
    const ordem = await this.localizador.localizar(entrada.codigo, entrada.documento);
    await this.rejeitarOrcamento.executar(ordem.id, entrada.motivo);
    return this.consultarAndamento.executar(entrada);
  }
}
