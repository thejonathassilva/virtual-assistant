import { MigrationInterface, QueryRunner } from 'typeorm';

const DEFAULT_ID = '11111111-1111-4111-8111-111111111111';

/** Corrige coluna criada por synchronize com valores NULL. */
export class MesaRestauranteIdBackfill1700000000003 implements MigrationInterface {
  name = 'MesaRestauranteIdBackfill1700000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasColumn = await queryRunner.query(`
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'mesas' AND column_name = 'restaurante_id'
    `);
    if (!hasColumn?.length) return;

    await queryRunner.query(`
      UPDATE "mesas" SET "restaurante_id" = '${DEFAULT_ID}'::uuid
      WHERE "restaurante_id" IS NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "mesas" ALTER COLUMN "restaurante_id" SET NOT NULL
    `);
  }

  public async down(): Promise<void> {
    /* irreversível sem risco de perda de dados */
  }
}
