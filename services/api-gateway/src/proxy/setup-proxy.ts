import { UnauthorizedException } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { isPublicRoute } from '../auth/public-routes';
import { buildProxyEntries } from './proxy.config';

export function setupApiProxy(app: NestExpressApplication): void {
  const expressApp = app.getHttpAdapter().getInstance();
  const entries = buildProxyEntries();

  expressApp.use((req: Request, res: Response, next: NextFunction) => {
    const path = (req.originalUrl || req.url || '').split('?')[0];

    if (
      !path.startsWith('/api') ||
      path.startsWith('/api/docs') ||
      path === '/api/health'
    ) {
      next();
      return;
    }

    if (!isPublicRoute(req.method, path)) {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({
          statusCode: 401,
          message: 'Token JWT ausente',
          error: 'Unauthorized',
        });
        return;
      }
      const token = authHeader.slice(7);
      const secret = process.env.JWT_SECRET || 'dev-jwt-secret';
      try {
        jwt.verify(token, secret);
      } catch {
        res.status(401).json({
          statusCode: 401,
          message: 'Token JWT inválido ou expirado',
          error: 'Unauthorized',
        });
        return;
      }
    }

    const entry = entries.find((e) => e.filter(path));
    if (!entry) {
      res.status(404).json({
        statusCode: 404,
        message: `Rota não roteada: ${req.method} ${path}`,
      });
      return;
    }

    createProxyMiddleware({ ...entry.options, pathFilter: () => true })(
      req,
      res,
      next,
    );
  });
}
