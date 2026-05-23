process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.TYPEORM_SYNC = process.env.TYPEORM_SYNC || 'true';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5433/restaurante_catalog';
process.env.REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
