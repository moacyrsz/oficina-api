import { Inject, Injectable } from '@nestjs/common';
import { RecursoNaoEncontrado } from '../../../shared/domain/excecoes';
import { UNIDADE_DE_TRABALHO, UnidadeDeTrabalho } from '../../../shared/application/unidade-de-trabalho';
import {
  ORDEM_DE_SERVICO_REPOSITORY,
  OrdemDeServicoRepository,
} from '../domain/ordem-de-servico.repository';
import { OrdemDeServicoSaida, paraSaida } from './ordem-de-servico.saida';

/**
 * Conclui a execucao dos servicos, movendo a ordem para "Finalizada" e
 * registrando o instante da finalizacao (usado no calculo do tempo medio).
 */
@Injectable()
export class FinalizarOrdemUseCase {
  constructor(
    @Inject(ORDEM_DE_SERVICO_REPOSITORY) private readonly ordens: OrdemDeServicoRepository,
    @Inject(UNIDADE_DE_TRABALHO) private readonly unidadeDeTrabalho: UnidadeDeTrabalho,
  ) {}

  public async executar(ordemId: string): Promise<OrdemDeServicoSaida> {
    return this.unidadeDeTrabalho.executar(async () => {
      const ordem = await this.ordens.buscarPorIdParaAtualizar(ordemId);
      if (!ordem) {
        throw new RecursoNaoEncontrado('Ordem de servico nao encontrada.');
      }
      ordem.finalizar();
      await this.ordens.salvar(ordem);
      return paraSaida(ordem);
    });
  }
}
