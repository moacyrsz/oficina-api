import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ContextoDeTransacao } from '../../../shared/infrastructure/database/contexto-de-transacao';
import { RepositorioTypeorm } from '../../../shared/infrastructure/database/repositorio-typeorm.base';
import { Placa } from '../domain/placa';
import { Veiculo } from '../domain/veiculo';
import { VeiculoRepository } from '../domain/veiculo.repository';
import { VeiculoMapper } from './veiculo.mapper';
import { VeiculoOrmEntity } from './veiculo.orm-entity';

@Injectable()
export class VeiculoRepositoryTypeorm extends RepositorioTypeorm implements VeiculoRepository {
  constructor(dataSource: DataSource, contexto: ContextoDeTransacao) {
    super(dataSource, contexto);
  }

  private get repositorio() {
    return this.manager.getRepository(VeiculoOrmEntity);
  }

  public async salvar(veiculo: Veiculo): Promise<void> {
    await this.repositorio.save(VeiculoMapper.paraPersistencia(veiculo));
  }

  public async buscarPorId(id: string): Promise<Veiculo | null> {
    const registro = await this.repositorio.findOne({ where: { id } });
    return registro ? VeiculoMapper.paraDominio(registro) : null;
  }

  public async buscarPorPlaca(placa: string): Promise<Veiculo | null> {
    let placaNormalizada: string;
    try {
      placaNormalizada = Placa.criar(placa).valor;
    } catch {
      // Uma placa em formato invalido nunca corresponde a um registro existente.
      return null;
    }

    const registro = await this.repositorio.findOne({ where: { placa: placaNormalizada } });
    return registro ? VeiculoMapper.paraDominio(registro) : null;
  }

  public async listar(): Promise<Veiculo[]> {
    const registros = await this.repositorio.find({ order: { placa: 'ASC' } });
    return registros.map((registro) => VeiculoMapper.paraDominio(registro));
  }

  public async remover(id: string): Promise<void> {
    await this.repositorio.delete({ id });
  }
}
