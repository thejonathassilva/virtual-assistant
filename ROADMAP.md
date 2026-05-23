# Roadmap

## Concluído (MVP local)

- [x] Microserviços + Docker Compose
- [x] Frontend Angular (cliente, staff, admin)
- [x] Fotos de produtos (volume local)
- [x] Cozinha / garçom / caixa / realtime
- [x] Admin: produtos, empresa, config IA, **usuários**
- [x] Métricas IA com gráficos no painel admin
- [x] Chat com streaming (SSE)
- [x] Documentação local + templates AWS/GCP/Azure
- [x] Script `scripts/smoke-test.ps1`
- [x] Remoção do `frontend-legacy`
- [x] Migrations TypeORM + `synchronize` desligado em produção
- [x] Testes unitários (auth, catalog)
- [x] CI GitHub Actions (build + testes)
- [x] UX: branding dinâmico, tema warm, cardápio/chat melhorados

## Próximo (qualidade)

- [ ] Testes de integração (DB + Redis em CI)
- [ ] Smoke test no pipeline CI (Docker Compose)
- [ ] E-mails de dev `@duasmaos.com` (opcional)

## Nuvem (quando necessário)

Escolher **um** provedor por ambiente. Templates em `env/cloud/`.

| Ordem | Item |
|-------|------|
| 1 | RDS/Cloud SQL + Redis gerenciados |
| 2 | Containers (ECS / Cloud Run / Container Apps) |
| 3 | Object storage (S3 / GCS / Blob) |
| 4 | IdP (Cognito / Identity Platform / Entra) |
| 5 | LLM real (Bedrock / Vertex / Azure OpenAI) |
| 6 | Filas + observabilidade |

Ver [docs/cloud-providers.md](docs/cloud-providers.md).
