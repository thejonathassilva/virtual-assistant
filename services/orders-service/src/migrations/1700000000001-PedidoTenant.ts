import { MigrationInterface, QueryRunner } from 'typeorm';

const DEFAULT_ID = '11111111-1111-4111-8111-111111111111';

export class PedidoTenant1700000000001 implements MigrationInterface {
  name = 'PedidoTenant1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "pedidos" ADD COLUMN IF NOT EXISTS "restaurante_id" uuid NOT NULL DEFAULT '${DEFAULT_ID}'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "pedidos" DROP COLUMN IF EXISTS "restaurante_id"`);
  }
}
