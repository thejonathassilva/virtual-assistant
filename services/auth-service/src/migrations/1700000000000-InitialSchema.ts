import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."usuarios_role_enum" AS ENUM('admin', 'cozinha', 'garcom', 'caixa');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "usuarios" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "nome" character varying NOT NULL,
        "email" character varying NOT NULL,
        "cognito_sub" character varying,
        "senha_hash" character varying,
        "role" "public"."usuarios_role_enum" NOT NULL,
        "ativo" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_d7281c63c176e152e4c531594a8" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_446adfc18b35418aac32ae0b7b5" UNIQUE ("email")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "usuarios"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."usuarios_role_enum"`);
  }
}
