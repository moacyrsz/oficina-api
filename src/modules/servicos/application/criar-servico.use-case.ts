import { Inject, Injectable } from '@nestjs/common';
import { Dinheiro } from '../../../shared/domain/dinheiro';
import { Servico } from '../domain/servico';
import { SERVICO_REPOSITORY, ServicoRepository } from '../domain/servico.repository';
import { ServicoSaida, paraSaida } from './servico.saida';

export interface EntradaCriarServico {
  nome: string;
  descricao?: string;
  valor: number;
}

/**
 * Cadastra um novo servico no catalogo. Recebe o valor em reais e o converte no
 * objeto de valor Dinheiro antes de montar o agregado.
 */
@Injectable()
export class CriarServicoUseCase {
  constructor(@Inject(SERVICO_REPOSITORY) private readonly servicos: ServicoRepository) {}

  public async executar(entrada: EntradaCriarServico): Promise<ServicoSaida> {
    const servico = Servico.criar({
      nome: entrada.nome,
      descricao: entrada.descricao,
      valor: Dinheiro.deReais(entrada.valor),
    });

    await this.servicos.salvar(servico);

    return paraSaida(servico);
  }
}
