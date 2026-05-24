import { MigrationInterface, QueryRunner } from 'typeorm';

const DEFAULT_SLUG = 'duas-maos-uma-mesa';

export class MesaRestauranteSlug1700000000002 implements MigrationInterface {
  name = 'MesaRestauranteSlug1700000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "mesas" ADD COLUMN IF NOT EXISTS "restaurante_slug" varchar(120)
    `);
    await queryRunner.query(`
      UPDATE "mesas" SET "restaurante_slug" = '${DEFAULT_SLUG}'
      WHERE "restaurante_slug" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "mesas" DROP COLUMN IF EXISTS "restaurante_slug"`,
    );
  }
}
