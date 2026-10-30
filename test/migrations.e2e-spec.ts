import { INestApplication } from '@nestjs/common';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { conexaoPostgres, criarAppDeTeste, usandoPostgres } from './suporte/app-de-teste';

/**
 * As migrations sao SQL do PostgreSQL, por isso estes testes so rodam com
 * TESTE_BANCO=postgres (npm run test:e2e:pg). No modo PostgreSQL, todos os
 * testes de integracao usam o schema criado pelas migrations.
 */
const descrever = usandoPostgres ? describe : describe.skip;

const MIGRATION_INICIAL = 'EsquemaInicial1793037380673';

descrever('Migrations no PostgreSQL (e2e)', () => {
  it('criam exatamente o schema mapeado pelas entidades', async () => {
    const app: INestApplication = await criarAppDeTeste();
    try {
      const banco = app.get(DataSource);

      const pendencias = await banco.driver.createSchemaBuilder().log();
      const executadas: { name: string }[] = await banco.query('SELECT name FROM migrations');

      expect(pendencias.upQueries.map((consulta) => consulta.query)).toEqual([]);
      expect(executadas.map((migration) => migration.name)).toContain(MIGRATION_INICIAL);
    } finally {
      await app.close();
    }
  });

  it('apenas se registram em um banco criado antes pelo synchronize', async () => {
    const banco = new DataSource({
      ...conexaoPostgres,
      entities: [join(__dirname, '../src/**/*.orm-entity.ts')],
      migrations: [join(__dirname, '../src/database/migrations/*.ts')],
      dropSchema: true,
      synchronize: true,
    });
    await banco.initialize();
    try {
      const aplicadas = await banco.runMigrations();

      expect(aplicadas.map((migration) => migration.name)).toEqual([MIGRATION_INICIAL]);
      const pendencias = await banco.driver.createSchemaBuilder().log();
      expect(pendencias.upQueries).toEqual([]);
    } finally {
      await banco.destroy();
    }
  });
});
