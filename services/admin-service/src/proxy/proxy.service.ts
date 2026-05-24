import { HttpService } from '@nestjs/axios';
import {
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { AxiosError, Method } from 'axios';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ProxyService {
  constructor(private readonly http: HttpService) {}

  async forward(req: Request, res: Response, baseUrl: string): Promise<void> {
    const base = baseUrl.replace(/\/$/, '');
    const targetUrl = `${base}${req.originalUrl}`;

    const headers: Record<string, string> = {};
    if (req.headers.authorization) {
      headers.authorization = req.headers.authorization;
    }
    if (req.headers['content-type']) {
      headers['content-type'] = req.headers['content-type'] as string;
    }
    if (req.headers['x-restaurante-id']) {
      headers['x-restaurante-id'] = req.headers['x-restaurante-id'] as string;
    }
    if (req.headers['x-user-role']) {
      headers['x-user-role'] = req.headers['x-user-role'] as string;
    }

    try {
      const response = await firstValueFrom(
        this.http.request({
          method: req.method as Method,
          url: targetUrl,
          data: req.body,
          headers,
          validateStatus: () => true,
        }),
      );

      res.status(response.status);
      Object.entries(response.headers).forEach(([key, value]) => {
        if (
          value &&
          !['transfer-encoding', 'connection', 'content-encoding'].includes(
            key.toLowerCase(),
          )
        ) {
          res.setHeader(key, value as string | string[]);
        }
      });
      res.send(response.data);
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        res.status(error.response.status).send(error.response.data);
        return;
      }
      throw new InternalServerErrorException('Falha ao encaminhar requisição');
    }
  }

  getAuthBaseUrl(): string {
    const url = process.env.AUTH_SERVICE_URL;
    if (!url) {
      throw new HttpException('AUTH_SERVICE_URL não configurada', 500);
    }
    return url.replace(/\/$/, '');
  }

  getAiBaseUrl(): string {
    const url = process.env.AI_SERVICE_URL;
    if (!url) {
      throw new HttpException('AI_SERVICE_URL não configurada', 500);
    }
    return url.replace(/\/$/, '');
  }
}
