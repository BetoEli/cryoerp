import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MikroORM } from '@mikro-orm/postgresql';
import request from 'supertest';
import { App } from 'supertest/types';
import helmet from 'helmet';
import { AppModule } from '../src/app.module';

describe('Auth Guard (e2e)', () => {
  let app: INestApplication<App>;
  let orm: MikroORM;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.use(helmet());

    app.enableCors({
      origin: ['http://localhost:5173'],
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      credentials: true,
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    app.setGlobalPrefix('api');

    orm = app.get(MikroORM);

    await app.init();
  });

  afterAll(async () => {
    await orm.close(true);
    await app.close();
  });

  it('GET /api/health returns 200 without an API key', async () => {
    await request(app.getHttpServer()).get('/api/health').expect(200);
  });

  it('GET /api/locations returns 401 without an API key', async () => {
    await request(app.getHttpServer()).get('/api/locations').expect(401);
  });

  it('GET /api/locations returns 200 with a valid X-API-Key header', async () => {
    await request(app.getHttpServer())
      .get('/api/locations')
      .set('X-API-Key', 'test-api-key')
      .expect(200);
  });

  it('POST /api/locations returns 401 without an API key', async () => {
    await request(app.getHttpServer())
      .post('/api/locations')
      .send({ name: 'Test', type: 'fridge' })
      .expect(401);
  });
});
