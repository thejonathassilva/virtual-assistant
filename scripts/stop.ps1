# Para todos os containers do projeto
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root
docker compose down
Write-Host "Stack parada." -ForegroundColor Green
