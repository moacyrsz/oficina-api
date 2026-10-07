import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
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
 * Sobe a aplicacao completa para os testes de integracao usando um PostgreSQL
 * em memoria (pg-mem). Nenhum container e necessario: o mesmo mapeamento TypeORM
 * de producao e exercitado contra um banco Postgres emulado em processo.
 */
export async function criarAppDeTeste(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        type: 'sqljs',
        autoSave: false,
        location: 'oficina-teste',
        autoLoadEntities: true,
        synchronize: true,
      }),
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
