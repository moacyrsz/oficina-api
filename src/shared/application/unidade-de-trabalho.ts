/**
 * Porta da Unidade de Trabalho. Permite que um caso de uso execute um conjunto
 * de operacoes de forma atomica (tudo ou nada), sem acoplar a camada de
 * aplicacao a uma tecnologia de persistencia especifica. A implementacao de
 * producao usa transacoes do PostgreSQL via TypeORM.
 */
export interface UnidadeDeTrabalho {
  executar<T>(operacao: () => Promise<T>): Promise<T>;
}

export const UNIDADE_DE_TRABALHO = Symbol('UnidadeDeTrabalho');
