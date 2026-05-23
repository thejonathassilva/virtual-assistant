# Contrato de variáveis de ambiente

Variáveis agrupadas por **capacidade**, não por provedor. O código lê a capacidade; o deploy preenche valores do AWS, GCP ou Azure.

## Metadados de deploy

| Variável | Local | Nuvem |
|----------|-------|-------|
| `DEPLOY_TARGET` | `local` | `aws` \| `gcp` \| `azure` |
| `NODE_ENV` | `development` | `production` |

## URLs da aplicação

| Variável | Descrição |
|----------|-----------|
| `APP_URL` | URL pública do frontend |
| `API_URL` | URL pública da API (`/api`) |
| `AUTH_SERVICE_URL` | URL interna auth (Docker: `http://auth-service:3001`) |
| `CATALOG_SERVICE_URL` | … |
| `TABLES_SERVICE_URL` | … |
| `ORDERS_SERVICE_URL` | … |
| `AI_SERVICE_URL` | … |
| `REALTIME_SERVICE_URL` | … |
| `ADMIN_SERVICE_URL` | … |

## Banco e cache

| Variável | Local | Nuvem |
|----------|-------|-------|
| `DATABASE_URL` | `postgresql://...@postgres:5432/...` | connection string gerenciada |
| `REDIS_URL` | `redis://redis:6379` | ElastiCache / Memorystore / Azure Redis |

## Autenticação (`AUTH_PROVIDER`)

| Valor | Comportamento |
|-------|----------------|
| `local-jwt` | Login com email/senha no `auth-service`, JWT assinado com `JWT_SECRET` |
| `aws-cognito` | Validar JWT do Cognito (futuro) |
| `gcp-identity` | Identity Platform (futuro) |
| `azure-entra` | Entra ID (futuro) |

| Variável | Uso |
|----------|-----|
| `JWT_SECRET` | Apenas `local-jwt` |
| `COGNITO_USER_POOL_ID` | AWS |
| `COGNITO_APP_CLIENT_ID` | AWS |
| `GCP_PROJECT_ID` | GCP |
| `AZURE_TENANT_ID` | Azure |
| `AZURE_CLIENT_ID` | Azure |

## Armazenamento de mídia (`STORAGE_BACKEND`)

| Valor | Implementação |
|-------|----------------|
| `local` | `UPLOAD_DIR` + volume Docker (padrão) |
| `s3` | AWS S3 (futuro) |
| `gcs` | Google Cloud Storage (futuro) |
| `azure-blob` | Azure Blob (futuro) |

| Variável | Uso |
|----------|-----|
| `UPLOAD_DIR` | Caminho no disco (`local`) |
| `MEDIA_PUBLIC_PATH` | Prefixo URL pública (`/api/media/produtos`) |
| `STORAGE_BUCKET` | Nome do bucket (nuvem) |
| `STORAGE_REGION` | Região do bucket |

## IA (`LLM_PROVIDER`)

| Valor | Comportamento |
|-------|----------------|
| `mock` | Respostas simuladas + tools reais (padrão local) |
| `aws-bedrock` | Amazon Bedrock |
| `gcp-vertex` | Vertex AI (futuro) |
| `azure-openai` | Azure OpenAI (futuro) |

Compatibilidade: se `LLM_PROVIDER` não estiver definido e `BEDROCK_MOCK=true`, equivale a `mock`.

### AWS Bedrock (`LLM_PROVIDER=aws-bedrock`)

| Variável |
|----------|
| `AWS_REGION` |
| `AWS_ACCESS_KEY_ID` (ou IAM role no ECS) |
| `AWS_SECRET_ACCESS_KEY` |
| `BEDROCK_MODEL_ID` |
| `BEDROCK_KNOWLEDGE_BASE_ID` |
| `BEDROCK_GUARDRAIL_ID` |
| `BEDROCK_GUARDRAIL_VERSION` |
| `BEDROCK_MOCK` → use `false` |

### GCP Vertex (futuro)

| Variável |
|----------|
| `GCP_PROJECT_ID` |
| `GCP_REGION` |
| `VERTEX_MODEL_ID` |
| `VERTEX_KB_RESOURCE` |

### Azure OpenAI (futuro)

| Variável |
|----------|
| `AZURE_OPENAI_ENDPOINT` |
| `AZURE_OPENAI_API_KEY` |
| `AZURE_OPENAI_DEPLOYMENT` |
| `AZURE_AI_SEARCH_ENDPOINT` |

## Implementação atual vs planejada

| Capacidade | Status |
|------------|--------|
| `STORAGE_BACKEND=local` | Implementado |
| `AUTH_PROVIDER=local-jwt` | Implementado |
| `LLM_PROVIDER=mock` | Implementado (`BEDROCK_MOCK=true`) |
| `LLM_PROVIDER=aws-bedrock` | Parcial (`realConverse` no ai-service) |
| `LLM_PROVIDER=gcp-vertex` | Planejado |
| `LLM_PROVIDER=azure-openai` | Planejado |
| `STORAGE_BACKEND=s3/gcs/azure-blob` | Planejado |
