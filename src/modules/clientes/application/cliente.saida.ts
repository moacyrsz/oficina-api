import { Cliente } from '../domain/cliente';

export interface ClienteSaida {
  id: string;
  nome: string;
  documento: string;
  tipoDocumento: 'CPF' | 'CNPJ';
  email: string;
  telefone: string;
}

/**
 * Converte o agregado Cliente para uma estrutura simples de saida, com o
 * documento ja formatado com mascara. Mantem os controllers isolados do modelo
 * de dominio.
 */
export function paraSaida(cliente: Cliente): ClienteSaida {
  return {
    id: cliente.id,
    nome: cliente.nome,
    documento: cliente.documento.formatado,
    tipoDocumento: cliente.documento.tipo,
    email: cliente.email,
    telefone: cliente.telefone,
  };
}
