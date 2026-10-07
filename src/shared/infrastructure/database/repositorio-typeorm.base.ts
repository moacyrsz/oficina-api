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
}
