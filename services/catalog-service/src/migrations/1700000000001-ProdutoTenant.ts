import { MigrationInterface, QueryRunner } from 'typeorm';

const DEFAULT_ID = '11111111-1111-4111-8111-111111111111';

export class ProdutoTenant1700000000001 implements MigrationInterface {
  name = 'ProdutoTenant1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "produtos" ADD COLUMN IF NOT EXISTS "restaurante_id" uuid NOT NULL DEFAULT '${DEFAULT_ID}'
    `);
    await queryRunner.query(`
      ALTER TABLE "produtos" DROP CONSTRAINT IF EXISTS "produtos_nome_key"
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_produtos_restaurante_nome"
      ON "produtos" ("restaurante_id", "nome")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_produtos_restaurante_nome"`);
    await queryRunner.query(`ALTER TABLE "produtos" DROP COLUMN IF EXISTS "restaurante_id"`);
  }
}
