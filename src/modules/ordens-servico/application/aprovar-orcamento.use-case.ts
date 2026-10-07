import { Inject, Injectable } from '@nestjs/common';
import { RecursoNaoEncontrado } from '../../../shared/domain/excecoes';
import { UNIDADE_DE_TRABALHO, UnidadeDeTrabalho } from '../../../shared/application/unidade-de-trabalho';
import {
  ORDEM_DE_SERVICO_REPOSITORY,
  OrdemDeServicoRepository,
} from '../domain/ordem-de-servico.repository';
import { GESTAO_DE_ESTOQUE, GestaoDeEstoque } from './ports/gestao-de-estoque';
import { OrdemDeServicoSaida, paraSaida } from './ordem-de-servico.saida';

/**
 * Registra a aprovacao do orcamento e inicia a execucao. Este e o fluxo
 * transacional critico: a mudanca de status da ordem e a baixa de estoque das
 * pecas ocorrem na mesma transacao. Se o estoque for insuficiente, a baixa
 * falha e toda a operacao e desfeita, deixando a ordem em "Aguardando aprovacao".
 */
@Injectable()
export class AprovarOrcamentoUseCase {
  constructor(
    @Inject(ORDEM_DE_SERVICO_REPOSITORY) private readonly ordens: OrdemDeServicoRepository,
    @Inject(GESTAO_DE_ESTOQUE) private readonly estoque: GestaoDeEstoque,
    @Inject(UNIDADE_DE_TRABALHO) private readonly unidadeDeTrabalho: UnidadeDeTrabalho,
  ) {}

  public async executar(ordemId: string): Promise<OrdemDeServicoSaida> {
    return this.unidadeDeTrabalho.executar(async () => {
      const ordem = await this.ordens.buscarPorId(ordemId);
      if (!ordem) {
        throw new RecursoNaoEncontrado('Ordem de servico nao encontrada.');
      }

      ordem.aprovarOrcamento();

      const itensParaBaixa = ordem.itensPeca.map((item) => ({
        pecaId: item.pecaId,
        quantidade: item.quantidade,
      }));

      if (itensParaBaixa.length > 0) {
        await this.estoque.baixar(itensParaBaixa);
      }

      await this.ordens.salvar(ordem);
      return paraSaida(ordem);
    });
  }
}
