import { Peca } from '../domain/peca';

export interface PecaSaida {
  id: string;
  nome: string;
  descricao: string;
  precoUnitario: number;
  quantidadeEmEstoque: number;
}

/**
 * Converte o agregado Peca para uma estrutura simples de saida, com o preco em
 * reais. Mantem os controllers isolados do modelo de dominio.
 */
export function paraSaida(peca: Peca): PecaSaida {
  return {
    id: peca.id,
    nome: peca.nome,
    descricao: peca.descricao,
    precoUnitario: peca.precoUnitario.reais,
    quantidadeEmEstoque: peca.quantidadeEmEstoque,
  };
}
