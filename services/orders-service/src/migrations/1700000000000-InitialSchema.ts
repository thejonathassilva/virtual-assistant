import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."pedidos_status_enum" AS ENUM(
          'aberto', 'enviado_cozinha', 'em_preparo', 'pronto', 'entregue', 'cancelado', 'pago'
        );
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."pedidos_origem_enum" AS ENUM('cliente', 'garcom', 'ia');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "public"."itens_pedido_status_enum" AS ENUM(
          'pendente', 'em_preparo', 'pronto', 'entregue', 'cancelado'
        );
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "pedidos" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "mesa_id" uuid NOT NULL,
        "sessao_id" uuid NOT NULL,
        "status" "public"."pedidos_status_enum" NOT NULL DEFAULT 'aberto',
        "origem" "public"."pedidos_origem_enum" NOT NULL,
        "valor_total" numeric(10,2) NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_pedidos" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "itens_pedido" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "pedido_id" uuid NOT NULL,
        "produto_id" uuid NOT NULL,
        "quantidade" integer NOT NULL DEFAULT 1,
        "preco_unitario" numeric(10,2) NOT NULL,
        "observacao" character varying,
        "status" "public"."itens_pedido_status_enum" NOT NULL DEFAULT 'pendente',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_itens_pedido" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "itens_pedido"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "pedidos"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."itens_pedido_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."pedidos_origem_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."pedidos_status_enum"`);
  }
}
