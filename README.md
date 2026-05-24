# Duas Mãos, Uma Mesa

Restaurante com **cardápio digital**, **pedidos em tempo real** (cozinha, garçom, caixa) e **assistente virtual** com IA (modo simulado em desenvolvimento local).

Stack: **Angular 18** + **NestJS** (microserviços) + **PostgreSQL** + **Redis** + **Socket.IO**, orquestrado com **Docker Compose**.

---

## Pré-requisitos

| Ferramenta | Versão mínima |
|------------|----------------|
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | 24+ (WSL2 no Windows) |
| Node.js (opcional, só dev Angular) | 20+ |
| PowerShell (Windows) | 5.1+ |

Não é necessária conta em nuvem para rodar localmente.

---

## Subir tudo (recomendado)

Na raiz do projeto:

```powershell
cd c:\dev\virtual-chat-assistant
copy .env.example .env
.\scripts\setup.ps1
```

O script:

1. Cria `.env` se não existir  
2. Sobe Postgres e Redis  
3. Faz build e sobe **todos** os serviços (API, front, realtime)  

Aguarde alguns minutos na primeira vez (build das imagens).

### URLs após subir

| O quê | URL |
|-------|-----|
| **Aplicação (Angular)** | http://localhost:4201 |
| **API** | http://localhost:3008/api |
| **Swagger (gateway)** | http://localhost:3008/api/docs |
| **WebSocket** (via nginx do front) | http://localhost:4201/socket.io/ |

### Login da equipe

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Plataforma (Facilita Virtual) | platform@facilita.com | Restaurante@123 |
| Admin | admin@restaurante.com | Restaurante@123 |
| Cozinha | cozinha@restaurante.com | Restaurante@123 |
| Garçom | garcom@restaurante.com | Restaurante@123 |
| Caixa | caixa@restaurante.com | Restaurante@123 |

Acesse http://localhost:4201/login e depois:

- **Plataforma:** `/platform` — cadastrar restaurantes, cotas de IA, **gráficos de métricas (7 dias)** por restaurante, custo estimado e criar o admin inicial. A cota de tokens **renova automaticamente** no dia `quota_renovacao_em` (uso zerado; próximo ciclo = dia 1 do mês seguinte).  
- **Admin:** `/admin` — produtos, usuários, empresa, mesas/QR, config IA  
- **Cozinha:** `/cozinha`  
- **Garçom:** `/garcom`  
- **Caixa:** `/caixa`  

### Cliente na mesa (QR / link)

Os QR codes apontam para URLs com slug do restaurante:

- Mesa: `http://localhost:4201/r/duas-maos-uma-mesa/mesa/{id-da-mesa}`  
- Cardápio: `.../cardapio`  
- Assistente: `.../chat`  

Links antigos `/mesa/{id}` redirecionam automaticamente para a URL com slug.

No admin, novos restaurantes passam pelo **onboarding** (`/admin/onboarding`): empresa → cardápio → mesas/QR.

---

## Comandos úteis

```powershell
# Subir (sem script)
docker compose up -d --build

# Ver status
docker compose ps

# Logs de um serviço
docker compose logs -f api-gateway

# Parar tudo
docker compose down

# Parar e apagar volumes (reset banco + fotos)
docker compose down -v
```

```powershell
# Teste rápido da API
.\scripts\smoke-test.ps1

# Testes unitários (Jest)
.\scripts\run-tests.ps1

# Testes de integração (Postgres + Redis) — ver infra/test/README.md
.\scripts\run-integration-tests.ps1
```

---

## Desenvolvimento do frontend (opcional)

Com a API já rodando no Docker (`:3008`):

```powershell
cd frontend
npm install
npm start
```

Abre http://localhost:4200 com proxy para a API (ver `frontend/proxy.conf.json`).

---

## Arquitetura (visão geral)

```
Browser → Frontend :4201 (nginx)
              ├─ /api/*     → API Gateway :3008
              └─ /socket.io → Realtime :3006

API Gateway → auth | catalog | tables | orders | ai | admin
                    ↓
              PostgreSQL (6 bancos) + Redis
```

| Serviço | Função |
|---------|--------|
| **api-gateway** | Entrada única `/api`, JWT, CORS |
| **auth-service** | Login e usuários |
| **catalog-service** | Produtos, cardápio, fotos |
| **tables-service** | Mesas e sessões |
| **orders-service** | Pedidos, cozinha, caixa |
| **ai-service** | Chat e configuração de IA |
| **realtime-service** | WebSocket (cozinha, garçom, mesa) |
| **admin-service** | Dados da empresa + proxy admin |

Diagramas e detalhes: [arquitetura.md](arquitetura.md), [docs/arquitetura-local.md](docs/arquitetura-local.md).

---

## Configuração (`.env`)

Copie `.env.example` → `.env`. Principais variáveis:

| Variável | Padrão local | Descrição |
|----------|--------------|-----------|
| `APP_URL` | http://localhost:4201 | URL do front (QR das mesas) |
| `API_URL` | http://localhost:3008 | API no host |
| `JWT_SECRET` | (dev) | Assinatura do token |
| `LLM_PROVIDER` | `mock` | IA simulada (sem AWS) |
| `BEDROCK_MOCK` | `true` | Não chama Bedrock real |

Nuvem futura (AWS / GCP / Azure): [docs/cloud-providers.md](docs/cloud-providers.md).

---

## Estrutura do repositório

```
├── docker-compose.yml    # sobe toda a stack
├── .env.example
├── frontend/             # Angular 18
├── services/             # microserviços NestJS
│   ├── api-gateway/
│   ├── auth-service/
│   ├── catalog-service/
│   ├── tables-service/
│   ├── orders-service/
│   ├── ai-service/
│   ├── realtime-service/
│   └── admin-service/
├── infra/postgres/       # criação dos 6 bancos
├── data/knowledge-base/  # base para RAG (futuro)
├── scripts/              # setup.ps1, smoke-test.ps1
└── docs/                 # documentação extra
```

---

## Problemas comuns

| Sintoma | O que fazer |
|---------|-------------|
| Porta 3008 ou 4201 em uso | Pare o processo ou altere portas no `docker-compose.yml` |
| `docker compose` falha no build | `docker compose build --no-cache api-gateway` e veja o log |
| Login 401 | Body: `{"email":"...","senha":"..."}` (campo é **senha**, não `password`) |
| Front sem API | Confirme `docker compose ps` — `api-gateway` e `frontend` healthy |
| WebSocket cozinha/garçom não conecta | Acesse pelo front `:4201` (não abra só `:3006` no dev Docker) |
| Nome antigo da empresa no admin | Reinicie `admin-service` ou edite em `/admin/empresa` |
| `restaurante_id` contains null values (tables-service) | `docker compose up -d --build tables-service` (migrations corrigem dados legados). Se persistir: `docker compose down -v` (apaga o Postgres local) |
| Reset completo | `docker compose down -v` e `.\scripts\setup.ps1` de novo |

---

## Roadmap

Itens futuros (migrations, CI, nuvem): [ROADMAP.md](ROADMAP.md).

---

## Licença

Projeto educacional / case técnico.
