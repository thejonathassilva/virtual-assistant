import { MigrationInterface, QueryRunner } from 'typeorm';

const DEFAULT_ID = '11111111-1111-4111-8111-111111111111';

export class SeedDefaultRestaurante1700000000002 implements MigrationInterface {
  name = 'SeedDefaultRestaurante1700000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "restaurantes" (
        "id", "slug", "nome", "ativo", "token_quota_mensal",
        "tokens_usados_mes", "quota_ilimitada", "quota_renovacao_em"
      ) VALUES (
        '${DEFAULT_ID}',
        'duas-maos-uma-mesa',
        'Duas Mãos, Uma Mesa',
        true,
        500000,
        0,
        false,
        (CURRENT_DATE + INTERVAL '1 month')::date
      )
      ON CONFLICT ("id") DO NOTHING
    `);
    await queryRunner.query(`
      UPDATE "empresa" SET "restaurante_id" = '${DEFAULT_ID}'::uuid
      WHERE "restaurante_id" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "restaurantes" WHERE "id" = '${DEFAULT_ID}'`);
  }
}
