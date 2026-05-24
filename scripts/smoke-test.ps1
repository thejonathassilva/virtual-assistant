# Smoke test - API local (docker compose up)
$ErrorActionPreference = "Stop"
$Base = if ($env:API_URL) { $env:API_URL } else { "http://localhost:3008/api" }

function Fail($msg) {
  Write-Host "FAIL: $msg" -ForegroundColor Red
  exit 1
}

function Ok($msg) {
  Write-Host "OK: $msg" -ForegroundColor Green
}

Write-Host "Smoke test em $Base"
Write-Host ""

try {
  $loginBody = '{"email":"admin@restaurante.com","senha":"Restaurante@123"}'
  $login = Invoke-RestMethod -Uri "$Base/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
  if (-not $login.access_token) { Fail "login sem token" }
  Ok "login admin"
} catch {
  Fail "login: $($_.Exception.Message)"
}

$headers = @{ Authorization = "Bearer $($login.access_token)" }

try {
  $cardapio = @(Invoke-RestMethod -Uri "$Base/cardapio")
  if ($cardapio.Count -lt 1) { Fail "cardapio vazio" }
  Ok "cardapio com $($cardapio.Count) itens"
} catch {
  Fail "cardapio: $($_.Exception.Message)"
}

try {
  $mesasRaw = Invoke-RestMethod -Uri "$Base/mesas" -Headers $headers
  $mesas = @($mesasRaw)
  if ($mesas.Count -lt 1) { Fail "sem mesas" }
  $livre = $mesas | Where-Object { $_.status -eq 'livre' } | Select-Object -First 1
  if ($livre) {
    $script:mesaId = $livre.id
    $null = Invoke-RestMethod -Uri "$Base/mesas/$mesaId/abrir-sessao" -Method POST -Headers $headers
    Ok "mesas: $($mesas.Count) (sessao aberta na mesa $($livre.numero))"
  } else {
    $script:mesaId = $mesas[0].id
    Ok "mesas: $($mesas.Count) (reutiliza sessao existente)"
  }
} catch {
  Fail "mesas/sessao: $($_.Exception.Message)"
}

try {
  $chat = Invoke-RestMethod -Uri "$Base/chat/$mesaId/mensagem" -Method POST -ContentType "application/json" -Body '{"mensagem":"ola"}'
  if (-not $chat.resposta) { Fail "chat sem resposta" }
  Ok "chat IA"
} catch {
  Fail "chat: $($_.Exception.Message)"
}

try {
  $usuarios = @(Invoke-RestMethod -Uri "$Base/admin/usuarios" -Headers $headers)
  if ($usuarios.Count -lt 1) { Fail "admin usuarios vazio" }
  Ok "admin usuarios: $($usuarios.Count)"
} catch {
  Fail "admin usuarios: $($_.Exception.Message)"
}

try {
  $platformBody = '{"email":"platform@facilita.com","senha":"Restaurante@123"}'
  $platformLogin = Invoke-RestMethod -Uri "$Base/auth/login" -Method POST -ContentType "application/json" -Body $platformBody
  $platformHeaders = @{ Authorization = "Bearer $($platformLogin.access_token)" }
  $restaurantes = @(Invoke-RestMethod -Uri "$Base/platform/restaurantes" -Headers $platformHeaders)
  if ($restaurantes.Count -lt 1) { Fail "platform sem restaurantes" }
  Ok "platform: $($restaurantes.Count) restaurante(s)"
} catch {
  Fail "platform: $($_.Exception.Message)"
}

try {
  $chatPedido = Invoke-RestMethod -Uri "$Base/chat/$mesaId/mensagem" -Method POST -ContentType "application/json" -Body '{"mensagem":"quero uma batata frita crocante e um refrigerante lata"}'
  if ($chatPedido.resposta -notmatch "Adicionei|adicionei|pedido") {
    Fail "chat pedido sem confirmacao: $($chatPedido.resposta)"
  }
  Ok "chat pedido multi-item"
} catch {
  Fail "chat pedido: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "Smoke test concluido com sucesso." -ForegroundColor Cyan
