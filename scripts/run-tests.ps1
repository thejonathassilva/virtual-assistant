# Executa testes unitários dos serviços com Jest
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

$services = @('auth-service', 'catalog-service')

foreach ($svc in $services) {
  Write-Host "`n=== $svc ===" -ForegroundColor Cyan
  Push-Location (Join-Path $root "services\$svc")
  if (-not (Test-Path node_modules)) { npm ci 2>$null; if ($LASTEXITCODE -ne 0) { npm install } }
  npm test
  if ($LASTEXITCODE -ne 0) { Pop-Location; exit 1 }
  Pop-Location
}

Write-Host "`nTestes concluidos." -ForegroundColor Green
