import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { AuthModule } from '../../src/modules/auth/auth.module';
import { HASH_DE_SENHA, HashDeSenha } from '../../src/modules/auth/application/ports/hash-de-senha';
import { Usuario } from '../../src/modules/auth/domain/usuario';
import { USUARIO_REPOSITORY, UsuarioRepository } from '../../src/modules/auth/domain/usuario.repository';
import { ClientesModule } from '../../src/modules/clientes/clientes.module';
import { OrdensServicoModule } from '../../src/modules/ordens-servico/ordens-servico.module';
import { PecasModule } from '../../src/modules/pecas/pecas.module';
import { ServicosModule } from '../../src/modules/servicos/servicos.module';
import { VeiculosModule } from '../../src/modules/veiculos/veiculos.module';
import { SharedModule } from '../../src/shared/shared.module';
import { FiltroDeExcecoes } from '../../src/shared/infrastructure/http/filtro-de-excecoes';

export const CREDENCIAIS_ADMIN = { email: 'admin@oficina.com.br', senha: 'Admin@123' };

/**
 * Banco dos testes de integracao. Por padrao e um banco relacional em memoria
 * (sql.js, SQLite compilado para WebAssembly), sem nenhum container. Com
 * TESTE_BANCO=postgres os mesmos testes rodam contra um PostgreSQL real, o que
 * permite verificar o que o sql.js nao suporta, como o bloqueio pessimista
 * (SELECT ... FOR UPDATE) sob concorrencia.
 */
export const usandoPostgres = process.env.TESTE_BANCO === 'postgres';

export const conexaoPostgres = {
  type: 'postgres' as const,
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME ?? 'oficina',
  password: process.env.DB_PASSWORD ?? 'oficina',
  // Banco exclusivo de testes: o schema e apagado a cada execucao.
  database: process.env.DB_DATABASE_TESTE ?? 'oficina_teste',
};

async function garantirBancoDeTestes(): Promise<void> {
  const administracao = new DataSource({ ...conexaoPostgres, database: 'postgres' });
  await administracao.initialize();
  try {
    const existente = await administracao.query('SELECT 1 FROM pg_database WHERE datname = $1', [
      conexaoPostgres.database,
    ]);
    if (existente.length === 0) {
      await administracao.query(`CREATE DATABASE "${conexaoPostgres.database}"`);
    }
  } finally {
    await administracao.destroy();
  }
}

async function opcoesDoBanco(): Promise<TypeOrmModuleOptions> {
  if (!usandoPostgres) {
    return { type: 'sqljs', autoSave: false, autoLoadEntities: true, synchronize: true };
  }
  await garantirBancoDeTestes();
  // No PostgreSQL o schema vem das migrations, como em producao.
  return {
    ...conexaoPostgres,
    autoLoadEntities: true,
    dropSchema: true,
    migrations: [join(__dirname, '../../src/database/migrations/*.ts')],
    migrationsRun: true,
  };
}

/**
 * Sobe a aplicacao completa para os testes de integracao: o mesmo mapeamento
 * TypeORM de producao e as mesmas transacoes, com o banco escolhido acima.
 */
export async function criarAppDeTeste(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot(await opcoesDoBanco()),
      SharedModule,
      AuthModule,
      ClientesModule,
      VeiculosModule,
      ServicosModule,
      PecasModule,
      OrdensServicoModule,
    ],
  }).compile();

  const app = moduleRef.createNestApplication();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new FiltroDeExcecoes());
  await app.init();

  const usuarios = app.get<UsuarioRepository>(USUARIO_REPOSITORY);
  const hash = app.get<HashDeSenha>(HASH_DE_SENHA);
  const senhaHash = await hash.gerar(CREDENCIAIS_ADMIN.senha);
  await usuarios.salvar(
    Usuario.criar({ nome: 'Administrador', email: CREDENCIAIS_ADMIN.email, senhaHash }),
  );

  return app;
}
