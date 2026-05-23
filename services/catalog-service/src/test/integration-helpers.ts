import Redis from 'ioredis';
import { Client } from 'pg';

export async function isPostgresAvailable(): Promise<boolean> {
  const url = process.env.DATABASE_URL;
  if (!url) return false;
  const client = new Client({ connectionString: url });
  try {
    await client.connect();
    await client.end();
    return true;
  } catch {
    return false;
  }
}

export async function isRedisAvailable(): Promise<boolean> {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  const client = new Redis(url, { maxRetriesPerRequest: 1, connectTimeout: 3000 });
  try {
    await client.ping();
    client.disconnect();
    return true;
  } catch {
    client.disconnect();
    return false;
  }
}

export function requireInfraInCi(available: boolean, label: string): void {
  if (!available && process.env.CI === 'true') {
    throw new Error(`${label} indisponível — necessário para testes de integração no CI`);
  }
}
