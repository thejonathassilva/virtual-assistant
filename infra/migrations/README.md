# Migrations TypeORM

Cada microserviço com banco PostgreSQL possui:

- `src/database/typeorm-options.ts` — config compartilhada (copiada de `infra/typeorm/`)
- `src/migrations/` — migrations versionadas

## Comportamento por ambiente

| Ambiente | `NODE_ENV` | Schema |
|----------|------------|--------|
| Local / dev | `development` (padrão) | `synchronize: true` |
| Produção | `production` | `synchronize: false`, `migrationsRun: true` |

Variáveis opcionais:

- `TYPEORM_SYNC=true|false` — força synchronize
- `TYPEORM_RUN_MIGRATIONS=true|false` — força execução de migrations

## Seeds

Seeds de usuários, produtos e empresa rodam **apenas fora de produção** (`NODE_ENV !== 'production'`).

## Gerar nova migration (futuro)

Com Postgres no ar e schema atualizado:

```powershell
cd services/auth-service
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5433/restaurante_auth"
npx typeorm migration:generate src/migrations/NomeDaMigration -d dist/data-source.js
```
