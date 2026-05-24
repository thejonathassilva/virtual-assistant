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
- [x] Testes de integração (DB + Redis em CI)

## Próximo (qualidade)

- [x] Smoke test no pipeline CI (Docker Compose)
- [ ] E-mails de dev `@duasmaos.com` (opcional)

## Produtização multi-tenant (visão)

Modelo alvo para SaaS do case:

| Perfil | Exemplo | Responsabilidades |
|--------|---------|-------------------|
| **Platform owner** | Facilita Virtual | Cadastra restaurantes (tenants), define cota de tokens/mês, vê métricas agregadas e % de uso |
| **Admin do restaurante** | Duas Mãos, Uma Mesa | Empresa, produtos, **mesas/QR**, usuários (cozinha, garçom, caixa), config IA do atendimento |
| **Operação** | Cozinha, garçom, caixa | Fluxo operacional (já existente) |

**Case / demo:** todos os perfis e dados já vêm no seed (admin restaurante + equipe + 10 mesas).

**Métricas (painel platform owner):**
- Linguagem para gestão (não técnica): % do pacote usado no mês, renovação da cota, custo em **R$**
- Cota por restaurante: limitada (tokens/mês) ou ilimitada (custo estimado ×10 para exibição)
- Conversão USD→BRL fixa (ex.: ×6) para o valor exibido
- Admin do restaurante **não** vê métricas de tokens/custo (apenas operação)

**Já feito nesta leva:**
- [x] Admin restaurante: cadastro de mesas + visualização/download do QR
- [x] UX mesa: botões cardápio/assistente legíveis
- [x] Chat mock: recomendações e “fazer pedido” sem confundir com nome de produto

**Implementado (multi-tenant MVP):**
- [x] Role `platform_owner` + painel `/platform`
- [x] Entidade `Restaurante` (tenant) ligada a usuários e dados
- [x] Cota de tokens e métricas simplificadas em R$ (painel plataforma)
- [x] Remover métricas IA do dashboard do admin do restaurante
- [x] Cadastro de restaurante na UI + admin inicial + seed de empresa por tenant

**Próximo (multi-tenant):**
- [x] Isolar catálogo, mesas e pedidos por `restaurante_id`
- [x] Onboarding: empresa + 5 mesas ao criar restaurante
- [ ] Renovação automática da cota mensal (`quota_renovacao_em`)
- [ ] Métricas IA agregadas no painel plataforma (gráfico 7 dias por tenant)
- [ ] Subdomínio ou slug na URL do cliente (`/r/{slug}/mesa/...`)

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
