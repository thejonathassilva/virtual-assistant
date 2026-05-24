export const DEFAULT_RESTAURANTE_ID = '11111111-1111-4111-8111-111111111111';

export function resolveRestauranteId(header?: string): string {
  return header?.trim() || DEFAULT_RESTAURANTE_ID;
}
