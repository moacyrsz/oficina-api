import { Inject, Injectable } from '@nestjs/common';
import { Dinheiro } from '../../../shared/domain/dinheiro';
import { RecursoNaoEncontrado } from '../../../shared/domain/excecoes';
import { SERVICO_REPOSITORY, ServicoRepository } from '../domain/servico.repository';
import { ServicoSaida, paraSaida } from './servico.saida';

export interface EntradaAtualizarServico {
  id: string;
  nome?: string;
  descricao?: string;
  valor?: number;
}

/**
 * Atualiza um servico existente. Quando o valor e informado, ele chega em reais
 * e e convertido para o objeto de valor Dinheiro. Falha com 404 se o servico
 * nao existir.
 */
@Injectable()
export class AtualizarServicoUseCase {
  constructor(@Inject(SERVICO_REPOSITORY) private readonly servicos: ServicoRepository) {}

  public async executar(entrada: EntradaAtualizarServico): Promise<ServicoSaida> {
    const servico = await this.servicos.buscarPorId(entrada.id);
    if (!servico) {
      throw new RecursoNaoEncontrado('Servico nao encontrado.');
    }

    servico.atualizar({
      nome: entrada.nome,
      descricao: entrada.descricao,
      valor: entrada.valor !== undefined ? Dinheiro.deReais(entrada.valor) : undefined,
    });

    await this.servicos.salvar(servico);

    return paraSaida(servico);
  }
}
