import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { carregarConfiguracao } from '../config/configuracao';

/**
 * Configura a conexao com o PostgreSQL. As entidades sao carregadas
 * automaticamente a partir dos modulos que as registram com forFeature,
 * mantendo cada contexto responsavel pelo seu proprio mapeamento.
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
          logging: configuracao.banco.logging,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
