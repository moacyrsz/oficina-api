import { Inject, Injectable } from '@nestjs/common';
import { RecursoNaoEncontrado } from '../../../shared/domain/excecoes';
import { UNIDADE_DE_TRABALHO, UnidadeDeTrabalho } from '../../../shared/application/unidade-de-trabalho';
import {
  ORDEM_DE_SERVICO_REPOSITORY,
  OrdemDeServicoRepository,
} from '../domain/ordem-de-servico.repository';
import { OrdemDeServicoSaida, paraSaida } from './ordem-de-servico.saida';

/**
 * Registra a rejeicao do orcamento pelo cliente. A ordem retorna para
 * "Em diagnostico" para que um novo orcamento possa ser elaborado.
 */
@Injectable()
export class RejeitarOrcamentoUseCase {
  constructor(
    @Inject(ORDEM_DE_SERVICO_REPOSITORY) private readonly ordens: OrdemDeServicoRepository,
    @Inject(UNIDADE_DE_TRABALHO) private readonly unidadeDeTrabalho: UnidadeDeTrabalho,
  ) {}

  public async executar(ordemId: string, motivo?: string): Promise<OrdemDeServicoSaida> {
    return this.unidadeDeTrabalho.executar(async () => {
      const ordem = await this.ordens.buscarPorIdParaAtualizar(ordemId);
      if (!ordem) {
        throw new RecursoNaoEncontrado('Ordem de servico nao encontrada.');
      }
      ordem.rejeitarOrcamento(motivo);
      await this.ordens.salvar(ordem);
      return paraSaida(ordem);
    });
  }
}
