# Provedor de LLM (multi-cloud)

## Contrato

O domínio do chat usa `BedrockService.converse()` hoje. Em produção, `LLM_PROVIDER` seleciona o adaptador:

| `LLM_PROVIDER` | Provedor | Status |
|----------------|----------|--------|
| `mock` | Local (sem API) | Implementado |
| `aws-bedrock` | Amazon Bedrock | Parcial |
| `gcp-vertex` | Vertex AI | Planejado |
| `azure-openai` | Azure OpenAI | Planejado |

## Variáveis

Ver [docs/env-contract.md](../../../../docs/env-contract.md).

## Regra de compatibilidade

- `LLM_PROVIDER=mock` ou `BEDROCK_MOCK=true` → modo local
- `LLM_PROVIDER=aws-bedrock` e `BEDROCK_MOCK=false` → Bedrock real

## Implementação futura

Criar `LlmProvider` interface e injetar via factory no `ChatModule`, sem alterar `ChatService` / tools.
