# Arquitetura

**Padrão:** execução **local** com Docker Compose (sem nuvem obrigatória).

**Futuro:** mesma arquitetura de microserviços em AWS, Google Cloud ou Azure — ver [docs/cloud-providers.md](docs/cloud-providers.md).

## Local (runtime atual)

```mermaid
flowchart TB
  subgraph local [Docker Compose - máquina do desenvolvedor]
    FE["Frontend :4201 (Duas Maos, Uma Mesa)"]
    GW[API Gateway :3008]
    AUTH[auth-service]
    CAT[catalog-service]
    TBL[tables-service]
    ORD[orders-service]
    AI[ai-service mock]
    RT[realtime-service :3006]
    ADM[admin-service]
    PG[(PostgreSQL)]
    RD[(Redis)]
    VOL[(catalog_uploads)]
  end

  FE --> GW
  GW --> AUTH & CAT & TBL & ORD & AI & ADM
  ORD --> CAT & TBL & RT
  AI --> ORD & CAT & RT
  AUTH & CAT & TBL & ORD & AI & ADM --> PG
  CAT & AI & RT --> RD
  CAT --> VOL
```

## Portabilidade (camada de adaptadores)

```mermaid
flowchart LR
  subgraph app [Microserviços NestJS - inalterados]
    CORE[Lógica de negócio]
  end

  subgraph adapters [Trocáveis por DEPLOY_TARGET]
    AUTH_A[local-jwt / Cognito / Entra / Identity]
    STORE[volume / S3 / GCS / Blob]
    LLM[mock / Bedrock / Vertex / Azure OpenAI]
  end

  CORE --> AUTH_A & STORE & LLM
```

| Documento | Conteúdo |
|-----------|----------|
| [docs/arquitetura-local.md](docs/arquitetura-local.md) | Diagrama, portas, bancos, comandos |
| [docs/cloud-providers.md](docs/cloud-providers.md) | Mapeamento AWS / GCP / Azure |
| [docs/env-contract.md](docs/env-contract.md) | Variáveis `AUTH_PROVIDER`, `STORAGE_BACKEND`, `LLM_PROVIDER` |

## Subir localmente

```powershell
copy .env.example .env
docker compose up -d --build
```
