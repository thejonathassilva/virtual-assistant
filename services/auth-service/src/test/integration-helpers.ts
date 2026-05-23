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

export function requireInfraInCi(available: boolean): void {
  if (!available && process.env.CI === 'true') {
    throw new Error('Postgres indisponível — necessário para testes de integração no CI');
  }
}
