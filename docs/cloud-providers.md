# Nuvem futura: AWS, Google Cloud e Azure

O projeto é **local-first**. Quando for para produção, escolha **um** provedor e preencha o template correspondente em `env/cloud/`.

Nenhum código de negócio deve importar SDK de nuvem diretamente no domínio — apenas em adaptadores (`bedrock/`, `media/`, `auth/`).

## Mapeamento por capacidade

| Capacidade | Local | AWS | Google Cloud | Microsoft Azure |
|------------|-------|-----|--------------|-----------------|
| **Containers** | Docker Compose | ECS Fargate | Cloud Run | Container Apps |
| **Registry** | build local | ECR | Artifact Registry | ACR |
| **Load balancer** | portas host | ALB | Cloud Load Balancing | App Gateway / Front Door |
| **PostgreSQL** | Postgres container | RDS PostgreSQL | Cloud SQL | Azure Database for PostgreSQL |
| **Redis** | Redis container | ElastiCache | Memorystore | Azure Cache for Redis |
| **Objetos (fotos)** | volume Docker | S3 | Cloud Storage | Blob Storage |
| **CDN + SPA** | nginx | CloudFront + S3 | Cloud CDN + GCS | Front Door + Blob |
| **Auth equipe** | JWT local | Cognito | Identity Platform | Entra ID (+ B2C se custom) |
| **Segredos** | `.env` | Secrets Manager | Secret Manager | Key Vault |
| **LLM** | mock | Bedrock | Vertex AI (Gemini) | Azure OpenAI |
| **RAG** | arquivos locais | Knowledge Bases + S3 | Vertex AI Search + GCS | AI Search + Blob |
| **Safety IA** | regras no código | Guardrails | Vertex safety | Content Safety |
| **Filas** | HTTP síncrono | SQS | Pub/Sub | Service Bus |
| **Logs/trace** | stdout Docker | CloudWatch + X-Ray | Logging + Trace | Monitor + App Insights |
| **WAF** | — | AWS WAF | Cloud Armor | WAF |

## Templates de ambiente

| Provedor | Arquivo |
|----------|---------|
| AWS | [env/cloud/aws.env.example](../env/cloud/aws.env.example) |
| GCP | [env/cloud/gcp.env.example](../env/cloud/gcp.env.example) |
| Azure | [env/cloud/azure.env.example](../env/cloud/azure.env.example) |

Copie o template para `.env` **somente** no ambiente de deploy (nunca commitar secrets).

## Valores de `DEPLOY_TARGET`

| Valor | Significado |
|-------|-------------|
| `local` | Docker Compose (padrão) |
| `aws` | Produção/staging AWS |
| `gcp` | Produção/staging Google Cloud |
| `azure` | Produção/staging Microsoft Azure |

## Serviços do projeto → dependências na nuvem

| Microserviço | Precisa na nuvem |
|--------------|------------------|
| api-gateway | ALB/LB, secrets, validação JWT (Cognito/Entra/etc.) |
| auth-service | RDS auth, IdP |
| catalog-service | RDS catalog, Redis, **object storage** |
| tables-service | RDS tables |
| orders-service | RDS orders, fila (opcional), realtime URL |
| ai-service | RDS ai, Redis, **LLM + RAG** |
| realtime-service | Redis (adapter), LB com WebSocket |
| admin-service | RDS admin, proxies internos |
| frontend | CDN + bucket ou container nginx |

## Ordem sugerida de migração (qualquer nuvem)

1. RDS/Cloud SQL + Redis gerenciados  
2. Subir containers (ECS/Cloud Run/Container Apps)  
3. S3/GCS/Blob para fotos (`STORAGE_BACKEND` ≠ `local`)  
4. IdP (Cognito / Identity Platform / Entra)  
5. LLM real (`LLM_PROVIDER` ≠ `mock`)  
6. Filas + observabilidade + WAF  

## Custo

Estimativas indicativas estão no histórico do projeto; use os calculadores oficiais de cada provedor antes do deploy.
