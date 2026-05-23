import { Produto } from '../core/models';

/** URL absoluta da foto vinda do backend (nunca asset local do front). */
export function produtoFotoUrl(produto: Pick<Produto, 'foto_url'> | null | undefined): string | null {
  const url = produto?.foto_url?.trim();
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return url;
  return `/api/media/produtos/${url}`;
}
