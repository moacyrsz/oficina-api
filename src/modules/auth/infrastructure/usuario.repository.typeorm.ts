import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ContextoDeTransacao } from '../../../shared/infrastructure/database/contexto-de-transacao';
import { RepositorioTypeorm } from '../../../shared/infrastructure/database/repositorio-typeorm.base';
import { Usuario } from '../domain/usuario';
import { UsuarioRepository } from '../domain/usuario.repository';
import { UsuarioOrmEntity } from './usuario.orm-entity';

@Injectable()
export class UsuarioRepositoryTypeorm extends RepositorioTypeorm implements UsuarioRepository {
  constructor(dataSource: DataSource, contexto: ContextoDeTransacao) {
    super(dataSource, contexto);
  }

  public async buscarPorEmail(email: string): Promise<Usuario | null> {
    const registro = await this.manager
      .getRepository(UsuarioOrmEntity)
      .findOne({ where: { email } });

    if (!registro) {
      return null;
    }

    return Usuario.restaurar(
      { nome: registro.nome, email: registro.email, senhaHash: registro.senhaHash },
      registro.id,
    );
  }

  public async salvar(usuario: Usuario): Promise<void> {
    await this.manager.getRepository(UsuarioOrmEntity).save({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      senhaHash: usuario.senhaHash,
    });
  }
}
