import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."mesas_status_enum" AS ENUM('livre', 'ocupada', 'aguardando_pagamento');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."sessoes_mesa_status_enum" AS ENUM('ativa', 'encerrada');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "sessoes_mesa" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "mesa_id" uuid NOT NULL,
        "inicio" TIMESTAMP WITH TIME ZONE NOT NULL,
        "fim" TIMESTAMP WITH TIME ZONE,
        "status" "public"."sessoes_mesa_status_enum" NOT NULL DEFAULT 'ativa',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_sessoes_mesa" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "mesas" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "numero" integer NOT NULL,
        "qr_code_url" character varying,
        "sessao_ativa_id" uuid,
        "status" "public"."mesas_status_enum" NOT NULL DEFAULT 'livre',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_mesas" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_mesas_numero" UNIQUE ("numero")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "mesas"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "sessoes_mesa"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."sessoes_mesa_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."mesas_status_enum"`);
  }
}
