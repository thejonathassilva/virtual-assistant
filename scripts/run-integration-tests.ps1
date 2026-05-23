# Executa testes de integração (Postgres + Redis)
param(
  [string]$PgPort = "5433",
  [string]$RedisUrl = "redis://localhost:6379"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

$env:CI = "true"
$env:NODE_ENV = "test"
$env:TYPEORM_SYNC = "true"

Write-Host "Verificando Postgres em localhost:$PgPort..." -ForegroundColor Cyan
$pgOk = $false
try {
  $tcp = New-Object System.Net.Sockets.TcpClient
  $tcp.Connect("localhost", [int]$PgPort)
  $tcp.Close()
  $pgOk = $true
} catch {
  Write-Host "Postgres indisponivel em :$PgPort" -ForegroundColor Yellow
  Write-Host "Suba com: docker compose up -d postgres" -ForegroundColor Yellow
}

if (-not $pgOk) { exit 1 }

Write-Host "Verificando Redis em $RedisUrl..." -ForegroundColor Cyan
$redisOk = $false
try {
  $uri = [Uri]$RedisUrl
  $tcp = New-Object System.Net.Sockets.TcpClient
  $tcp.Connect($uri.Host, $(if ($uri.Port -gt 0) { $uri.Port } else { 6379 }))
  $tcp.Close()
  $redisOk = $true
} catch {
  Write-Host "Redis indisponivel em $RedisUrl" -ForegroundColor Yellow
  Write-Host "Opcoes: redis local na porta 6379 ou mapeie redis no docker-compose" -ForegroundColor Yellow
}

$services = @(
  @{
    Name = "auth-service"
    DatabaseUrl = "postgresql://postgres:postgres@localhost:${PgPort}/restaurante_auth"
    NeedsRedis = $false
  },
  @{
    Name = "catalog-service"
    DatabaseUrl = "postgresql://postgres:postgres@localhost:${PgPort}/restaurante_catalog"
    NeedsRedis = $true
  }
)

foreach ($svc in $services) {
  if ($svc.NeedsRedis -and -not $redisOk) {
    Write-Host "Pulando $($svc.Name) (Redis necessario)" -ForegroundColor Yellow
    continue
  }

  Write-Host "`n=== $($svc.Name) (integracao) ===" -ForegroundColor Cyan
  $env:DATABASE_URL = $svc.DatabaseUrl
  $env:REDIS_URL = $RedisUrl

  Push-Location (Join-Path $root "services\$($svc.Name)")
  if (-not (Test-Path node_modules)) {
    npm ci 2>$null
    if ($LASTEXITCODE -ne 0) { npm install }
  }
  npm run test:integration
  if ($LASTEXITCODE -ne 0) { Pop-Location; exit 1 }
  Pop-Location
}

Write-Host "`nTestes de integracao concluidos." -ForegroundColor Green
