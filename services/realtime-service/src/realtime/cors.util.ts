import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export function socketCorsOptions(): CorsOptions {
  const raw = process.env.CORS_ORIGIN;
  if (!raw) {
    return { origin: true, credentials: true };
  }
  return {
    origin: raw.split(',').map((value) => value.trim()),
    credentials: true,
  };
}
