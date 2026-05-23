import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { isPostgresAvailable, requireInfraInCi } from '../test/integration-helpers';

describe('Auth HTTP (integração)', () => {
  let app: INestApplication;
  let infraOk = false;

  beforeAll(async () => {
    infraOk = await isPostgresAvailable();
    requireInfraInCi(infraOk);
    if (!infraOk) return;

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  }, 60000);

  afterAll(async () => {
    await app?.close();
  });

  it('POST /auth/login retorna token com credenciais válidas', async () => {
    if (!infraOk) return;

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@restaurante.com', senha: 'Restaurante@123' })
      .expect(201);

    expect(res.body.access_token).toBeDefined();
    expect(res.body.user.email).toBe('admin@restaurante.com');
    expect(res.body.user.role).toBe('admin');
  });

  it('POST /auth/login rejeita senha inválida', async () => {
    if (!infraOk) return;

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@restaurante.com', senha: 'Errada123' })
      .expect(401);
  });

  it('GET /auth/me retorna usuário autenticado', async () => {
    if (!infraOk) return;

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@restaurante.com', senha: 'Restaurante@123' });

    const res = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${login.body.access_token}`)
      .expect(200);

    expect(res.body.email).toBe('admin@restaurante.com');
    expect(res.body.senha_hash).toBeUndefined();
  });
});
