import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ContextoDeTransacao } from '../../../shared/infrastructure/database/contexto-de-transacao';
import { RepositorioTypeorm } from '../../../shared/infrastructure/database/repositorio-typeorm.base';
import { Peca } from '../domain/peca';
import { PecaRepository } from '../domain/peca.repository';
import { PecaMapper } from './peca.mapper';
import { PecaOrmEntity } from './peca.orm-entity';

/**
 * Repositorio TypeORM de pecas. Usa sempre o EntityManager da base
 * (this.manager), de modo que a baixa de estoque disparada pela aprovacao da
 * ordem de servico participe da mesma transacao aberta pela Unidade de
 * Trabalho, preservando a atomicidade da operacao.
 */
@Injectable()
export class PecaRepositoryTypeorm extends RepositorioTypeorm implements PecaRepository {
  constructor(dataSource: DataSource, contexto: ContextoDeTransacao) {
    super(dataSource, contexto);
  }

  private get repositorio() {
    return this.manager.getRepository(PecaOrmEntity);
  }

  public async salvar(peca: Peca): Promise<void> {
    await this.repositorio.save(PecaMapper.paraPersistencia(peca));
  }

  public async buscarPorId(id: string): Promise<Peca | null> {
    const registro = await this.repositorio.findOne({ where: { id } });
    return registro ? PecaMapper.paraDominio(registro) : null;
  }

  public async buscarParaAtualizar(id: string): Promise<Peca | null> {
    // Bloqueio pessimista (SELECT ... FOR UPDATE) para serializar baixas
    // concorrentes do mesmo item e impedir overselling. Bancos de teste em
    // memoria (sqljs/sqlite) nao suportam esse lock, entao a leitura simples e
    // suficiente (execucao sequencial, sem concorrencia real).
    const suportaLock = !['sqljs', 'sqlite', 'better-sqlite3'].includes(
      this.dataSource.options.type as string,
    );
    const registro = await this.repositorio.findOne({
      where: { id },
      ...(suportaLock ? { lock: { mode: 'pessimistic_write' as const } } : {}),
    });
    return registro ? PecaMapper.paraDominio(registro) : null;
  }

  public async listar(): Promise<Peca[]> {
    const registros = await this.repositorio.find({ order: { nome: 'ASC' } });
    return registros.map((registro) => PecaMapper.paraDominio(registro));
  }

  public async remover(id: string): Promise<void> {
    await this.repositorio.delete({ id });
  }
}
