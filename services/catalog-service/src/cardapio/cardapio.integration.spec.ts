import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import {
  isPostgresAvailable,
  isRedisAvailable,
  requireInfraInCi,
} from '../test/integration-helpers';

describe('Cardápio HTTP (integração)', () => {
  let app: INestApplication;
  let infraOk = false;

  beforeAll(async () => {
    const pgOk = await isPostgresAvailable();
    const redisOk = await isRedisAvailable();
    infraOk = pgOk && redisOk;
    requireInfraInCi(pgOk, 'Postgres');
    requireInfraInCi(redisOk, 'Redis');
    if (!infraOk) return;

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  }, 60000);

  afterAll(async () => {
    await app?.close();
  });

  it('GET /cardapio retorna produtos ativos do banco', async () => {
    if (!infraOk) return;

    const res = await request(app.getHttpServer()).get('/cardapio').expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toMatchObject({
      nome: expect.any(String),
      ativo: true,
    });
  });

  it('GET /cardapio/entradas filtra por categoria', async () => {
    if (!infraOk) return;

    const res = await request(app.getHttpServer()).get('/cardapio/entradas').expect(200);

    expect(res.body.length).toBeGreaterThan(0);
    for (const p of res.body) {
      expect(p.categoria).toBe('entradas');
      expect(p.ativo).toBe(true);
    }
  });

  it('GET /cardapio/categoria-invalida retorna 400', async () => {
    if (!infraOk) return;

    await request(app.getHttpServer()).get('/cardapio/categoria-invalida').expect(400);
  });

  it('segunda chamada GET /cardapio usa cache Redis', async () => {
    if (!infraOk) return;

    const first = await request(app.getHttpServer()).get('/cardapio').expect(200);
    const second = await request(app.getHttpServer()).get('/cardapio').expect(200);

    expect(second.body.length).toBe(first.body.length);
    expect(second.body[0].id).toBe(first.body[0].id);
  });
});
