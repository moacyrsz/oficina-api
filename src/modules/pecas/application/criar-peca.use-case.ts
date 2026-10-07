import { Inject, Injectable } from '@nestjs/common';
import { Dinheiro } from '../../../shared/domain/dinheiro';
import { Peca } from '../domain/peca';
import { PECA_REPOSITORY, PecaRepository } from '../domain/peca.repository';
import { PecaSaida, paraSaida } from './peca.saida';

export interface EntradaCriarPeca {
  nome: string;
  descricao?: string;
  precoUnitario: number;
  quantidadeEmEstoque: number;
}

/**
 * Cadastra uma nova peca ou insumo. O preco chega em reais e e convertido para
 * o objeto de valor monetario antes de montar o agregado.
 */
@Injectable()
export class CriarPecaUseCase {
  constructor(@Inject(PECA_REPOSITORY) private readonly pecas: PecaRepository) {}

  public async executar(entrada: EntradaCriarPeca): Promise<PecaSaida> {
    const peca = Peca.criar({
      nome: entrada.nome,
      descricao: entrada.descricao,
      precoUnitario: Dinheiro.deReais(entrada.precoUnitario),
      quantidadeEmEstoque: entrada.quantidadeEmEstoque,
    });

    await this.pecas.salvar(peca);

    return paraSaida(peca);
  }
}
