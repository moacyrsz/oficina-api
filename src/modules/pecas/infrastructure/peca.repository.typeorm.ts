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
 * Trabalho, preservando a atomicidade da operacao. Toda alteracao de estoque
 * le a peca com buscarParaAtualizar, que bloqueia a linha ate o fim da
 * transacao.
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
    const registro = await this.repositorio.findOne({
      where: { id },
      ...this.bloqueioParaAtualizacao,
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
