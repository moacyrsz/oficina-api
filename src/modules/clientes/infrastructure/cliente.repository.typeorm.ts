import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ContextoDeTransacao } from '../../../shared/infrastructure/database/contexto-de-transacao';
import { RepositorioTypeorm } from '../../../shared/infrastructure/database/repositorio-typeorm.base';
import { Cliente } from '../domain/cliente';
import { ClienteRepository } from '../domain/cliente.repository';
import { ClienteMapper } from './cliente.mapper';
import { ClienteOrmEntity } from './cliente.orm-entity';

@Injectable()
export class ClienteRepositoryTypeorm extends RepositorioTypeorm implements ClienteRepository {
  constructor(dataSource: DataSource, contexto: ContextoDeTransacao) {
    super(dataSource, contexto);
  }

  private get repositorio() {
    return this.manager.getRepository(ClienteOrmEntity);
  }

  public async salvar(cliente: Cliente): Promise<void> {
    await this.repositorio.save(ClienteMapper.paraPersistencia(cliente));
  }

  public async buscarPorId(id: string): Promise<Cliente | null> {
    const registro = await this.repositorio.findOne({ where: { id } });
    return registro ? ClienteMapper.paraDominio(registro) : null;
  }

  public async buscarPorDocumento(documento: string): Promise<Cliente | null> {
    const digitos = documento.replace(/\D/g, '');
    const registro = await this.repositorio.findOne({ where: { documento: digitos } });
    return registro ? ClienteMapper.paraDominio(registro) : null;
  }

  public async listar(): Promise<Cliente[]> {
    const registros = await this.repositorio.find({ order: { nome: 'ASC' } });
    return registros.map((registro) => ClienteMapper.paraDominio(registro));
  }

  public async remover(id: string): Promise<void> {
    await this.repositorio.delete({ id });
  }
}
