# Duas Maos, Uma Mesa — sobe stack completa (Docker)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

Set-Location $root

if (-not (Test-Path "$root\.env")) {
  Copy-Item "$root\.env.example" "$root\.env"
  Write-Host "Criado .env a partir de .env.example"
}

Write-Host "=== Duas Maos, Uma Mesa — Docker Compose ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/3] Postgres + Redis..."
docker compose up -d postgres redis

Write-Host "Aguardando Postgres (ate 60s)..."
$maxWait = 60
$elapsed = 0
while ($elapsed -lt $maxWait) {
  $status = docker compose ps postgres --format json 2>$null | ConvertFrom-Json
  if ($status -and $status.Health -eq "healthy") { break }
  if (-not $status) {
    $ok = docker compose exec -T postgres pg_isready -U postgres 2>$null
    if ($LASTEXITCODE -eq 0) { break }
  }
  Start-Sleep -Seconds 3
  $elapsed += 3
}

Write-Host "[2/3] Build e start de todos os servicos (pode levar varios minutos na 1a vez)..."
docker compose up -d --build

Write-Host "[3/3] Aguardando API Gateway..."
Start-Sleep -Seconds 15

Write-Host ""
Write-Host "=== Pronto ===" -ForegroundColor Green
Write-Host "  App:      http://localhost:4201"
Write-Host "  API:      http://localhost:3008/api"
Write-Host "  Swagger:  http://localhost:3008/api/docs"
Write-Host "  Login:    admin@restaurante.com / Restaurante@123"
Write-Host ""
Write-Host "  Teste API:  .\scripts\smoke-test.ps1"
Write-Host "  Parar:      docker compose down"
Write-Host ""
