import { Inject, Injectable } from '@nestjs/common';
import {
  ORDEM_DE_SERVICO_REPOSITORY,
  OrdemDeServicoRepository,
} from '../domain/ordem-de-servico.repository';

export interface TempoMedioDeExecucao {
  ordensConsideradas: number;
  tempoMedioEmMinutos: number;
  tempoMedioEmHoras: number;
}

/**
 * Calcula o tempo medio de execucao dos servicos, considerando as ordens que ja
 * foram finalizadas. O tempo de cada ordem e medido do inicio da execucao
 * (aprovacao do orcamento) ate a finalizacao.
 */
@Injectable()
export class CalcularTempoMedioUseCase {
  constructor(
    @Inject(ORDEM_DE_SERVICO_REPOSITORY) private readonly ordens: OrdemDeServicoRepository,
  ) {}

  public async executar(): Promise<TempoMedioDeExecucao> {
    const ordens = await this.ordens.listar();

    const duracoes = ordens
      .map((ordem) => ordem.duracaoExecucaoEmMs)
      .filter((duracao): duracao is number => duracao !== null);

    if (duracoes.length === 0) {
      return { ordensConsideradas: 0, tempoMedioEmMinutos: 0, tempoMedioEmHoras: 0 };
    }

    const somaMs = duracoes.reduce((total, atual) => total + atual, 0);
    const mediaMs = somaMs / duracoes.length;

    return {
      ordensConsideradas: duracoes.length,
      tempoMedioEmMinutos: Number((mediaMs / 60000).toFixed(2)),
      tempoMedioEmHoras: Number((mediaMs / 3600000).toFixed(2)),
    };
  }
}
