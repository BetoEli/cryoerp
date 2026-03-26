import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { MikroORM } from '@mikro-orm/postgresql';

describe('Health (e2e)', () => {
  let app: INestApplication;
  const mockOrm = {
    isConnected: jest.fn(),
  };

  beforeEach(async () => {
    mockOrm.isConnected.mockReset();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MikroORM)
      .useValue(mockOrm)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /api/health should return 200 with connected status', async () => {
    mockOrm.isConnected.mockResolvedValue(true);

    const response = await request(app.getHttpServer())
      .get('/api/health')
      .expect(200);

    expect(response.body.status).toBe('ok');
    expect(response.body.database).toBe('connected');
    expect(response.body.timestamp).toEqual(expect.any(String));
  });

  it('GET /api/health should return 503 when database is disconnected', async () => {
    mockOrm.isConnected.mockResolvedValue(false);

    const response = await request(app.getHttpServer())
      .get('/api/health')
      .expect(503);

    expect(response.body.database).toBe('disconnected');
  });
});
