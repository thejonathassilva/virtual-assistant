const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isPublicRoute(method: string, path: string): boolean {
  const normalized = path.split('?')[0];

  if (normalized === '/health' || normalized === '/api/health') {
    return true;
  }

  if (normalized.startsWith('/api/docs')) {
    return true;
  }

  if (method === 'POST' && normalized === '/api/auth/login') {
    return true;
  }

  if (method === 'POST' && normalized === '/api/auth/refresh') {
    return true;
  }

  if (
    method === 'GET' &&
    (normalized === '/api/cardapio' ||
      normalized.startsWith('/api/cardapio/') ||
      normalized.startsWith('/api/media/'))
  ) {
    return true;
  }

  if (method === 'GET' && normalized === '/api/empresa') {
    return true;
  }

  if (normalized.startsWith('/api/chat')) {
    return true;
  }

  const mesaMatch = normalized.match(/^\/api\/mesas\/([^/]+)(\/.*)?$/);
  if (mesaMatch && UUID_PATTERN.test(mesaMatch[1])) {
    if (method === 'GET' && !mesaMatch[2]) return true;
    if (method === 'POST' && mesaMatch[2] === '/abrir-sessao') return true;
    if (method === 'GET' && mesaMatch[2] === '/pedido-atual') return true;
  }

  return false;
}
