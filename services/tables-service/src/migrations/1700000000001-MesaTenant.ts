import { MigrationInterface, QueryRunner } from 'typeorm';

const DEFAULT_ID = '11111111-1111-4111-8111-111111111111';

export class MesaTenant1700000000001 implements MigrationInterface {
  name = 'MesaTenant1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "mesas" ADD COLUMN IF NOT EXISTS "restaurante_id" uuid NOT NULL DEFAULT '${DEFAULT_ID}'
    `);
    await queryRunner.query(`
      ALTER TABLE "mesas" DROP CONSTRAINT IF EXISTS "mesas_numero_key"
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_mesas_restaurante_numero"
      ON "mesas" ("restaurante_id", "numero")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_mesas_restaurante_numero"`);
    await queryRunner.query(`ALTER TABLE "mesas" DROP COLUMN IF EXISTS "restaurante_id"`);
  }
}
