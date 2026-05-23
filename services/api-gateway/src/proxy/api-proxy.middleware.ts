import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { NextFunction, Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { isPublicRoute } from '../auth/public-routes';
import { buildProxyEntries } from './proxy.config';

@Injectable()
export class ApiProxyMiddleware implements NestMiddleware {
  private readonly entries = buildProxyEntries();

  use(req: Request, res: Response, next: NextFunction): void {
    const path = (req.originalUrl || req.url || req.path).split('?')[0];

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
        throw new UnauthorizedException('Token JWT ausente');
      }
      const token = authHeader.slice(7);
      const secret = process.env.JWT_SECRET || 'dev-jwt-secret';
      try {
        jwt.verify(token, secret);
      } catch {
        throw new UnauthorizedException('Token JWT inválido ou expirado');
      }
    }

    const entry = this.entries.find((e) => e.filter(path));
    if (!entry) {
      res.status(404).json({
        statusCode: 404,
        message: `Rota não roteada: ${req.method} ${path}`,
      });
      return;
    }

    createProxyMiddleware({ ...entry.options, pathFilter: () => true })(req, res, next);
  }
}

