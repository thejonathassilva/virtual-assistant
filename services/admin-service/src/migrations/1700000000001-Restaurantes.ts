import { MigrationInterface, QueryRunner } from 'typeorm';

export class Restaurantes1700000000001 implements MigrationInterface {
  name = 'Restaurantes1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "restaurantes" (
        "id" uuid NOT NULL,
        "slug" character varying(120) NOT NULL,
        "nome" character varying(255) NOT NULL,
        "ativo" boolean NOT NULL DEFAULT true,
        "token_quota_mensal" integer,
        "tokens_usados_mes" integer NOT NULL DEFAULT 0,
        "quota_ilimitada" boolean NOT NULL DEFAULT false,
        "quota_renovacao_em" date NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_restaurantes" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_restaurantes_slug" UNIQUE ("slug")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "empresa" ADD COLUMN IF NOT EXISTS "restaurante_id" uuid
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "empresa" DROP COLUMN IF EXISTS "restaurante_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "restaurantes"`);
  }
}
