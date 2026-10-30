import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ContextoDeTransacao } from '../../../shared/infrastructure/database/contexto-de-transacao';
import { RepositorioTypeorm } from '../../../shared/infrastructure/database/repositorio-typeorm.base';
import { OrdemDeServico } from '../domain/ordem-de-servico';
import {
  FiltroDeOrdens,
  OrdemDeServicoRepository,
} from '../domain/ordem-de-servico.repository';
import { OrdemDeServicoMapper } from './ordem-de-servico.mapper';
import { OrdemDeServicoOrmEntity } from './ordem-de-servico.orm-entity';

@Injectable()
export class OrdemDeServicoRepositoryTypeorm
  extends RepositorioTypeorm
  implements OrdemDeServicoRepository
{
  constructor(dataSource: DataSource, contexto: ContextoDeTransacao) {
    super(dataSource, contexto);
  }

  private get repositorio() {
    return this.manager.getRepository(OrdemDeServicoOrmEntity);
  }

  public async salvar(ordem: OrdemDeServico): Promise<void> {
    await this.repositorio.save(OrdemDeServicoMapper.paraPersistencia(ordem));
  }

  public async buscarPorId(id: string): Promise<OrdemDeServico | null> {
    const registro = await this.repositorio.findOne({ where: { id } });
    return registro ? OrdemDeServicoMapper.paraDominio(registro) : null;
  }

  public async buscarPorIdParaAtualizar(id: string): Promise<OrdemDeServico | null> {
    const registro = await this.repositorio.findOne({ where: { id }, ...this.bloqueioParaAtualizacao });
    return registro ? OrdemDeServicoMapper.paraDominio(registro) : null;
  }

  public async buscarPorCodigo(codigo: string): Promise<OrdemDeServico | null> {
    const registro = await this.repositorio.findOne({ where: { codigo } });
    return registro ? OrdemDeServicoMapper.paraDominio(registro) : null;
  }

  public async listar(filtro?: FiltroDeOrdens): Promise<OrdemDeServico[]> {
    const registros = await this.repositorio.find({
      where: filtro?.status ? { status: filtro.status } : {},
      order: { criadaEm: 'DESC' },
    });
    return registros.map((registro) => OrdemDeServicoMapper.paraDominio(registro));
  }
}
