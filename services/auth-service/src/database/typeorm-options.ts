import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { EntitySchema } from 'typeorm';

type EntityClass = Function | EntitySchema;

/**
 * TypeORM config compartilhada entre microserviços.
 * - Dev/local: synchronize=true (schema automático)
 * - Produção: synchronize=false + migrationsRun=true
 */
export function buildTypeOrmOptions(entities: EntityClass[]): TypeOrmModuleOptions {
  const isProd = process.env.NODE_ENV === 'production';
  const syncEnv = process.env.TYPEORM_SYNC;
  const synchronize =
    syncEnv === 'true' ? true : syncEnv === 'false' ? false : !isProd;

  const runMigrations =
    process.env.TYPEORM_RUN_MIGRATIONS === 'true' ||
    (isProd && process.env.TYPEORM_RUN_MIGRATIONS !== 'false');

  return {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities,
    synchronize,
    migrations: [`${__dirname}/../migrations/*{.ts,.js}`],
    migrationsRun: runMigrations && !synchronize,
  };
}
