import { MigrationInterface, QueryRunner } from 'typeorm';

const DEFAULT_ID = '11111111-1111-4111-8111-111111111111';

export class MetricaTenant1700000000001 implements MigrationInterface {
  name = 'MetricaTenant1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "metrica_ia_diaria" ADD COLUMN IF NOT EXISTS "restaurante_id" uuid
    `);
    await queryRunner.query(`
      UPDATE "metrica_ia_diaria" SET "restaurante_id" = '${DEFAULT_ID}'::uuid
      WHERE "restaurante_id" IS NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "metrica_ia_diaria" ALTER COLUMN "restaurante_id" SET NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "metrica_ia_diaria" ALTER COLUMN "restaurante_id" SET DEFAULT '${DEFAULT_ID}'::uuid
    `);
    await queryRunner.query(`
      ALTER TABLE "metrica_ia_diaria" DROP CONSTRAINT IF EXISTS "UQ_metrica_ia_diaria_data"
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_metrica_restaurante_data"
      ON "metrica_ia_diaria" ("restaurante_id", "data")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_metrica_restaurante_data"`);
    await queryRunner.query(`
      ALTER TABLE "metrica_ia_diaria" DROP COLUMN IF EXISTS "restaurante_id"
    `);
  }
}
