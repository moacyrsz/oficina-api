import { Inject, Injectable } from '@nestjs/common';
import {
  UNIDADE_DE_TRABALHO,
  UnidadeDeTrabalho,
} from '../../../shared/application/unidade-de-trabalho';
import { RecursoNaoEncontrado } from '../../../shared/domain/excecoes';
import { PECA_REPOSITORY, PecaRepository } from '../domain/peca.repository';
import { PecaSaida, paraSaida } from './peca.saida';

export interface EntradaReporEstoque {
  id: string;
  quantidade: number;
}

/**
 * Repoe o estoque de uma peca, somando a quantidade informada ao saldo atual.
 * A peca e lida com bloqueio dentro da transacao, entao reposicoes e baixas
 * simultaneas da mesma peca nao sobrescrevem o saldo umas das outras.
 */
@Injectable()
export class ReporEstoqueUseCase {
  constructor(
    @Inject(PECA_REPOSITORY) private readonly pecas: PecaRepository,
    @Inject(UNIDADE_DE_TRABALHO) private readonly unidadeDeTrabalho: UnidadeDeTrabalho,
  ) {}

  public async executar(entrada: EntradaReporEstoque): Promise<PecaSaida> {
    return this.unidadeDeTrabalho.executar(async () => {
      const peca = await this.pecas.buscarParaAtualizar(entrada.id);
      if (!peca) {
        throw new RecursoNaoEncontrado('Peca nao encontrada.');
      }

      peca.reporEstoque(entrada.quantidade);
      await this.pecas.salvar(peca);

      return paraSaida(peca);
    });
  }
}
