import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { carregarConfiguracao } from '../config/configuracao';

/**
 * DataSource usado pela CLI do TypeORM para gerar e aplicar migrations.
 * A aplicacao em si configura a conexao em database.module.ts.
 */
const configuracao = carregarConfiguracao();

export default new DataSource({
  type: 'postgres',
  host: configuracao.banco.host,
  port: configuracao.banco.port,
  username: configuracao.banco.username,
  password: configuracao.banco.password,
  database: configuracao.banco.database,
  entities: ['src/**/*.orm-entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: configuracao.banco.logging,
});
