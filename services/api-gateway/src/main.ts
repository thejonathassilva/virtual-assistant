import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { setupApiProxy } from './proxy/setup-proxy';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:4201';
  app.enableCors({
    origin: corsOrigin.split(',').map((o) => o.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  setupApiProxy(app);

  const config = new DocumentBuilder()
    .setTitle('API Gateway — Duas Mãos, Uma Mesa')
    .setDescription(
      'Ponto de entrada único (`/api/*`). Este Swagger documenta o gateway; ' +
        'a especificação completa está distribuída nos microserviços ' +
        '(auth `/docs`, catalog `/docs`, tables `/docs`, orders `/docs`, ai `/docs`, admin `/docs`). ' +
        'Rotas públicas: `GET /api/cardapio`, `GET /api/mesas/:id`, `/api/chat`, `/api/health`, `POST /api/auth/login|refresh`. ' +
        'Demais rotas exigem `Authorization: Bearer <JWT>`.',
    )
    .setVersion('0.1')
    .addBearerAuth()
    .addServer('/')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
}

bootstrap();
