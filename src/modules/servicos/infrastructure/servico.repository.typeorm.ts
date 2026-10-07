import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ContextoDeTransacao } from '../../../shared/infrastructure/database/contexto-de-transacao';
import { RepositorioTypeorm } from '../../../shared/infrastructure/database/repositorio-typeorm.base';
import { Servico } from '../domain/servico';
import { ServicoRepository } from '../domain/servico.repository';
import { ServicoMapper } from './servico.mapper';
import { ServicoOrmEntity } from './servico.orm-entity';

@Injectable()
export class ServicoRepositoryTypeorm extends RepositorioTypeorm implements ServicoRepository {
  constructor(dataSource: DataSource, contexto: ContextoDeTransacao) {
    super(dataSource, contexto);
  }

  private get repositorio() {
    return this.manager.getRepository(ServicoOrmEntity);
  }

  public async salvar(servico: Servico): Promise<void> {
    await this.repositorio.save(ServicoMapper.paraPersistencia(servico));
  }

  public async buscarPorId(id: string): Promise<Servico | null> {
    const registro = await this.repositorio.findOne({ where: { id } });
    return registro ? ServicoMapper.paraDominio(registro) : null;
  }

  public async listar(): Promise<Servico[]> {
    const registros = await this.repositorio.find({ order: { nome: 'ASC' } });
    return registros.map((registro) => ServicoMapper.paraDominio(registro));
  }

  public async remover(id: string): Promise<void> {
    await this.repositorio.delete({ id });
  }
}
