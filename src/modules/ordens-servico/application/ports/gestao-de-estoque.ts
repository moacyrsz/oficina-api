/**
 * Porta de leitura e baixa de estoque de pecas, consumida pela Ordem de Servico.
 * A baixa efetiva ocorre na aprovacao do orcamento e participa da mesma
 * transacao do caso de uso, garantindo consistencia entre estoque e ordem.
 */
export interface PecaDoEstoque {
  id: string;
  nome: string;
  valorCentavos: number;
  quantidadeDisponivel: number;
}

export interface ItemParaBaixa {
  pecaId: string;
  quantidade: number;
}

export interface GestaoDeEstoque {
  buscarPeca(id: string): Promise<PecaDoEstoque | null>;
  baixar(itens: ItemParaBaixa[]): Promise<void>;
}

export const GESTAO_DE_ESTOQUE = Symbol('GestaoDeEstoque');
