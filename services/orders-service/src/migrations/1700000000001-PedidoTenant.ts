import { MigrationInterface, QueryRunner } from 'typeorm';

const DEFAULT_ID = '11111111-1111-4111-8111-111111111111';

export class PedidoTenant1700000000001 implements MigrationInterface {
  name = 'PedidoTenant1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "pedidos" ADD COLUMN IF NOT EXISTS "restaurante_id" uuid
    `);
    await queryRunner.query(`
      UPDATE "pedidos" SET "restaurante_id" = '${DEFAULT_ID}'::uuid
      WHERE "restaurante_id" IS NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "pedidos" ALTER COLUMN "restaurante_id" SET NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "pedidos" ALTER COLUMN "restaurante_id" SET DEFAULT '${DEFAULT_ID}'::uuid
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pedidos" DROP COLUMN IF EXISTS "restaurante_id"`);
  }
}
