import { Injectable } from '@nestjs/common';
import { AprovarOrcamentoUseCase } from './aprovar-orcamento.use-case';
import {
  AndamentoDaOrdem,
  ConsultarAndamentoUseCase,
  EntradaConsultarAndamento,
} from './consultar-andamento.use-case';
import { LocalizadorDeOrdemDoCliente } from './localizador-de-ordem-do-cliente';

/**
 * Aprovacao do orcamento feita pelo proprio cliente, na API publica. Depois de
 * conferir o codigo da ordem e o documento, aplica a mesma aprovacao
 * transacional usada pela equipe da oficina (inclusive a baixa de estoque).
 */
@Injectable()
export class AprovarOrcamentoPeloClienteUseCase {
  constructor(
    private readonly localizador: LocalizadorDeOrdemDoCliente,
    private readonly aprovarOrcamento: AprovarOrcamentoUseCase,
    private readonly consultarAndamento: ConsultarAndamentoUseCase,
  ) {}

  public async executar(entrada: EntradaConsultarAndamento): Promise<AndamentoDaOrdem> {
    const ordem = await this.localizador.localizar(entrada.codigo, entrada.documento);
    await this.aprovarOrcamento.executar(ordem.id);
    return this.consultarAndamento.executar(entrada);
  }
}
