import { Options } from 'http-proxy-middleware';

function serviceUrl(envKey: string, fallback: string): string {
  return (process.env[envKey] || fallback).replace(/\/$/, '');
}

export function createProxyOptions(
  target: string,
  pathRewrite: Record<string, string>,
): Options {
  return {
    target,
    changeOrigin: true,
    pathRewrite,
    on: {
      proxyReq: (proxyReq, req) => {
        if (req.headers.authorization) {
          proxyReq.setHeader('authorization', req.headers.authorization);
        }
        if (req.headers['x-restaurante-id']) {
          proxyReq.setHeader('x-restaurante-id', req.headers['x-restaurante-id'] as string);
        }
        if (req.headers['x-user-role']) {
          proxyReq.setHeader('x-user-role', req.headers['x-user-role'] as string);
        }
      },
    },
  };
}

export interface ProxyEntry {
  filter: (pathname: string) => boolean;
  options: Options;
}

export function buildProxyEntries(): ProxyEntry[] {
  const auth = serviceUrl('AUTH_SERVICE_URL', 'http://localhost:3001');
  const catalog = serviceUrl('CATALOG_SERVICE_URL', 'http://localhost:3002');
  const tables = serviceUrl('TABLES_SERVICE_URL', 'http://localhost:3003');
  const orders = serviceUrl('ORDERS_SERVICE_URL', 'http://localhost:3004');
  const ai = serviceUrl('AI_SERVICE_URL', 'http://localhost:3005');
  const admin = serviceUrl('ADMIN_SERVICE_URL', 'http://localhost:3007');

  return [
    {
      filter: (pathname) =>
        /^\/api\/mesas\/[^/]+\/pedido-atual/.test(pathname),
      options: createProxyOptions(orders, { '^/api': '' }),
    },
    {
      filter: (pathname) => pathname.startsWith('/api/auth'),
      options: createProxyOptions(auth, { '^/api/auth': '/auth' }),
    },
    {
      filter: (pathname) => pathname.startsWith('/api/chat'),
      options: createProxyOptions(ai, { '^/api/chat': '/chat' }),
    },
    {
      filter: (pathname) => pathname.startsWith('/api/admin'),
      options: createProxyOptions(admin, { '^/api/admin': '' }),
    },
    {
      filter: (pathname) => pathname.startsWith('/api/platform'),
      options: createProxyOptions(admin, { '^/api/platform': '/platform' }),
    },
    {
      filter: (pathname) => pathname.startsWith('/api/public'),
      options: createProxyOptions(admin, { '^/api/public': '/public' }),
    },
    {
      filter: (pathname) => pathname.startsWith('/api/onboarding'),
      options: createProxyOptions(admin, { '^/api/onboarding': '/onboarding' }),
    },
    {
      filter: (pathname) => pathname === '/api/empresa',
      options: createProxyOptions(admin, { '^/api/empresa': '/empresa' }),
    },
    {
      filter: (pathname) =>
        pathname.startsWith('/api/pedidos') ||
        pathname.startsWith('/api/cozinha') ||
        pathname.startsWith('/api/caixa'),
      options: createProxyOptions(orders, { '^/api': '' }),
    },
    {
      filter: (pathname) => pathname.startsWith('/api/media'),
      options: createProxyOptions(catalog, { '^/api/media': '/media' }),
    },
    {
      filter: (pathname) =>
        pathname.startsWith('/api/produtos') ||
        pathname.startsWith('/api/cardapio'),
      options: createProxyOptions(catalog, { '^/api': '' }),
    },
    {
      filter: (pathname) => pathname.startsWith('/api/mesas'),
      options: createProxyOptions(tables, { '^/api': '' }),
    },
  ];
}
