import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Schema inicial, gerado pelo TypeORM a partir das entidades. Usa IF NOT EXISTS
 * porque bancos criados antes das migrations (pelo synchronize) ja tem estas
 * tabelas: nesse caso a migration apenas se registra.
 */
export class EsquemaInicial1793037380673 implements MigrationInterface {
  name = 'EsquemaInicial1793037380673';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "veiculos" ("id" character varying NOT NULL, "placa" character varying NOT NULL, "marca" character varying NOT NULL, "modelo" character varying NOT NULL, "ano" integer NOT NULL, "cliente_id" character varying NOT NULL, CONSTRAINT "PK_0c3daa1e5d16914bd9e7777cf77" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_3c7f2de70c4765a04c070a9f74" ON "veiculos" ("placa") `,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "pecas" ("id" character varying NOT NULL, "nome" character varying NOT NULL, "descricao" character varying NOT NULL, "preco_centavos" integer NOT NULL, "quantidade_em_estoque" integer NOT NULL, CONSTRAINT "PK_831c0fc9b2138f6b2a9a447bc78" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "servicos" ("id" character varying NOT NULL, "nome" character varying NOT NULL, "descricao" character varying NOT NULL, "valor_centavos" integer NOT NULL, CONSTRAINT "PK_91c99670ea2115d2028a48c5e0e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "ordens_servico" ("id" character varying NOT NULL, "codigo" character varying NOT NULL, "cliente_id" character varying NOT NULL, "veiculo_id" character varying NOT NULL, "status" character varying NOT NULL, "itens_servico" text NOT NULL, "itens_peca" text NOT NULL, "aprovacao" text, "historico" text NOT NULL, "criada_em" character varying NOT NULL, "iniciada_execucao_em" character varying, "finalizada_em" character varying, "entregue_em" character varying, CONSTRAINT "PK_7e88933ca1acb36785ccb55a34c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_54200b365883ce3b8f7ad48eaa" ON "ordens_servico" ("codigo") `,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "clientes" ("id" character varying NOT NULL, "nome" character varying NOT NULL, "documento" character varying NOT NULL, "tipo_documento" character varying NOT NULL, "email" character varying NOT NULL, "telefone" character varying NOT NULL, CONSTRAINT "PK_d76bf3571d906e4e86470482c08" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_fc002853c86bd15f82ef93bf42" ON "clientes" ("documento") `,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "usuarios" ("id" character varying NOT NULL, "nome" character varying NOT NULL, "email" character varying NOT NULL, "senha_hash" character varying NOT NULL, CONSTRAINT "UQ_446adfc18b35418aac32ae0b7b5" UNIQUE ("email"), CONSTRAINT "PK_d7281c63c176e152e4c531594a8" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "usuarios"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_fc002853c86bd15f82ef93bf42"`);
    await queryRunner.query(`DROP TABLE "clientes"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_54200b365883ce3b8f7ad48eaa"`);
    await queryRunner.query(`DROP TABLE "ordens_servico"`);
    await queryRunner.query(`DROP TABLE "servicos"`);
    await queryRunner.query(`DROP TABLE "pecas"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_3c7f2de70c4765a04c070a9f74"`);
    await queryRunner.query(`DROP TABLE "veiculos"`);
  }
}
