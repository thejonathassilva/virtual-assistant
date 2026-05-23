import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { socketCorsOptions } from './realtime/cors.util';
import { RedisIoAdapter } from './redis/redis-io.adapter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  const redisUrl = config.get<string>('REDIS_URL');

  if (redisUrl) {
    const redisAdapter = new RedisIoAdapter(app);
    await redisAdapter.connectToRedis(redisUrl);
    app.useWebSocketAdapter(redisAdapter);
    logger.log('Redis adapter habilitado para Socket.IO');
  } else {
    logger.warn(
      'REDIS_URL não definido — Socket.IO em modo single-instance',
    );
  }

  app.enableCors(socketCorsOptions());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: false,
    }),
  );

  const port = config.get<number>('PORT') ?? 3006;
  await app.listen(port);
  logger.log(`realtime-service escutando na porta ${port}`);
}

bootstrap();
