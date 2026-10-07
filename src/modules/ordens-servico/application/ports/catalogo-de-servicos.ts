/**
 * Porta de leitura do catalogo de servicos, consumida pela Ordem de Servico ao
 * incluir um servico. Isola o contexto de Ordens de Servico dos detalhes do
 * contexto de Servicos.
 */
export interface ServicoDoCatalogo {
  id: string;
  nome: string;
  valorCentavos: number;
}

export interface CatalogoDeServicos {
  buscarServico(id: string): Promise<ServicoDoCatalogo | null>;
}

export const CATALOGO_DE_SERVICOS = Symbol('CatalogoDeServicos');
