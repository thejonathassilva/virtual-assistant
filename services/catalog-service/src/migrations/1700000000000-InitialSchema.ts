import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."produtos_categoria_enum" AS ENUM(
          'entradas', 'pratos_principais', 'bebidas', 'sobremesas'
        );
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "produtos" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "nome" character varying NOT NULL,
        "descricao" text,
        "preco" numeric(10,2) NOT NULL,
        "categoria" "public"."produtos_categoria_enum" NOT NULL,
        "ingredientes" character varying array NOT NULL DEFAULT '{}',
        "alergenos" character varying array NOT NULL DEFAULT '{}',
        "tags" character varying array NOT NULL DEFAULT '{}',
        "foto_url" character varying,
        "tempo_preparo_minutos" integer NOT NULL DEFAULT 0,
        "ativo" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_a5d976312809192261ed96174f3" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_750b0e1ec48b90640360b3df8f7" UNIQUE ("nome")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "produtos"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."produtos_categoria_enum"`);
  }
}
