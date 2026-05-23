import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "empresa" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "nome" character varying(255) NOT NULL,
        "missao" text,
        "visao" text,
        "valores" text,
        "horario_funcionamento" jsonb,
        "endereco" character varying(500),
        "telefone" character varying(50),
        "formas_pagamento" character varying array NOT NULL DEFAULT '{}',
        "politica_cancelamento" text,
        "historia" text,
        "logo_url" character varying(500),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_empresa" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "empresa"`);
  }
}
