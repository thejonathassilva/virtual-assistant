import { MigrationInterface, QueryRunner } from 'typeorm';

export class PlatformOwnerAndTenant1700000000001 implements MigrationInterface {
  name = 'PlatformOwnerAndTenant1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE "public"."usuarios_role_enum" ADD VALUE IF NOT EXISTS 'platform_owner'
    `);
    await queryRunner.query(`
      ALTER TABLE "usuarios" ADD COLUMN IF NOT EXISTS "restaurante_id" uuid
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "usuarios" DROP COLUMN IF EXISTS "restaurante_id"`);
  }
}
