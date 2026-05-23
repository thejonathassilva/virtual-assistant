# Testes de integração

Testes HTTP com **Postgres** e **Redis** reais (sem mocks).

## Arquivos

| Serviço | Spec |
|---------|------|
| auth-service | `src/auth/auth.integration.spec.ts` |
| catalog-service | `src/cardapio/cardapio.integration.spec.ts` |

Config: `jest.integration.json` + `src/test/integration-env.ts`

## Local

1. Suba Postgres (e Redis para catalog):

```powershell
docker compose up -d postgres redis
```

2. Para catalog, Redis precisa estar acessível em `localhost:6379`. O compose não expõe Redis por padrão — opções:
   - Redis instalado localmente na porta 6379
   - Ou adicione temporariamente `ports: ["6379:6379"]` no serviço `redis` do `docker-compose.yml`

3. Execute:

```powershell
.\scripts\run-integration-tests.ps1
# ou
.\scripts\run-tests.ps1 -Integration
```

Postgres local usa porta **5433** (host) por padrão no script.

## CI

Job `integration-test` no GitHub Actions:

- Postgres 16 + Redis 7 como services
- `scripts/init-test-databases.sh` cria os bancos
- `npm run test:integration` em auth e catalog

## Variáveis

| Variável | Padrão local |
|----------|----------------|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5433/restaurante_*` |
| `REDIS_URL` | `redis://localhost:6379` |
| `NODE_ENV` | `test` |
| `TYPEORM_SYNC` | `true` |

Se Postgres/Redis não estiverem disponíveis **fora do CI**, os testes são ignorados (passam sem falhar). No CI (`CI=true`), a ausência de infra falha o job.
