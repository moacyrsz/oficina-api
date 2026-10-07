import { Servico } from '../domain/servico';

export interface ServicoSaida {
  id: string;
  nome: string;
  descricao: string;
  valor: number;
}

/**
 * Converte o agregado Servico para uma estrutura simples de saida, com o valor
 * monetario expresso em reais. Mantem os controllers isolados do modelo de
 * dominio.
 */
export function paraSaida(servico: Servico): ServicoSaida {
  return {
    id: servico.id,
    nome: servico.nome,
    descricao: servico.descricao,
    valor: servico.valor.reais,
  };
}
