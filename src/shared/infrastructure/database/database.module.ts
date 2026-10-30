import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { carregarConfiguracao } from '../config/configuracao';

/**
 * Configura a conexao com o PostgreSQL. As entidades sao carregadas
 * automaticamente a partir dos modulos que as registram com forFeature,
 * mantendo cada contexto responsavel pelo seu proprio mapeamento. As migrations
 * pendentes sao aplicadas na subida (DB_MIGRATIONS_RUN).
 */
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const configuracao = carregarConfiguracao();
        return {
          type: 'postgres',
          host: configuracao.banco.host,
          port: configuracao.banco.port,
          username: configuracao.banco.username,
          password: configuracao.banco.password,
          database: configuracao.banco.database,
          autoLoadEntities: true,
          synchronize: configuracao.banco.synchronize,
          migrations: [join(__dirname, '..', '..', '..', 'database', 'migrations', '*.{ts,js}')],
          migrationsRun: configuracao.banco.migrationsRun,
          logging: configuracao.banco.logging,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
