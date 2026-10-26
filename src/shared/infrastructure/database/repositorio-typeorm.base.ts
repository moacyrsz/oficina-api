import { DataSource, EntityManager } from 'typeorm';
import { ContextoDeTransacao } from './contexto-de-transacao';

/**
 * Base dos repositorios TypeORM. Resolve o EntityManager correto: se existe uma
 * transacao ativa (aberta pela Unidade de Trabalho) usa o manager dela; caso
 * contrario usa o manager padrao do DataSource. Isso garante que operacoes
 * agrupadas em um caso de uso transacional sejam atomicas.
 */
export abstract class RepositorioTypeorm {
  protected constructor(
    protected readonly dataSource: DataSource,
    protected readonly contexto: ContextoDeTransacao,
  ) {}

  protected get manager(): EntityManager {
    return this.contexto.obterManager() ?? this.dataSource.manager;
  }

  /**
   * Opcoes de leitura com bloqueio pessimista (SELECT ... FOR UPDATE), que
   * serializam alteracoes concorrentes da mesma linha ate o fim da transacao.
   * O banco em memoria dos testes (sql.js) nao suporta esse bloqueio e executa
   * uma operacao por vez, entao ali a leitura e simples.
   */
  protected get bloqueioParaAtualizacao(): { lock?: { mode: 'pessimistic_write' } } {
    const semSuporte = ['sqljs', 'sqlite', 'better-sqlite3'].includes(
      this.dataSource.options.type as string,
    );
    return semSuporte ? {} : { lock: { mode: 'pessimistic_write' } };
  }

  /** Indica se existe ao menos uma linha na tabela com a coluna igual ao valor. */
  protected async existeRegistro(tabela: string, coluna: string, valor: string): Promise<boolean> {
    const registro = await this.manager
      .createQueryBuilder()
      .select('1', 'existe')
      .from(tabela, 'registro')
      .where(`registro.${coluna} = :valor`, { valor })
      .limit(1)
      .getRawOne();
    return registro !== undefined;
  }
}
