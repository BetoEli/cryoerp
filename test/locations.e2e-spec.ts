import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MikroORM } from '@mikro-orm/postgresql';
import request from 'supertest';
import { App } from 'supertest/types';
import helmet from 'helmet';
import { AppModule } from '../src/app.module';
import { LocationType } from '../src/locations/enums/location-type.enum';

type LocationResponse = {
  id: number;
  name: string;
  description?: string;
  type: LocationType;
  createdAt: string;
  updatedAt?: string;
};

describe('Locations (e2e)', () => {
  let app: INestApplication<App>;
  let orm: MikroORM;
  let createdLocationId: number;

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
    await orm.getSchemaGenerator().refreshDatabase();

    await app.init();
  });

  afterAll(async () => {
    await orm.close(true);
    await app.close();
  });

  it('POST /api/locations creates a location and returns 201', async () => {
    const payload = {
      name: 'Kitchen',
      type: LocationType.FRIDGE,
      description: 'Main kitchen fridge',
    };

    const response = await request(app.getHttpServer())
      .post('/api/locations')
      .send(payload)
      .expect(201);

    const body = response.body as LocationResponse;

    expect(body.id).toEqual(expect.any(Number));
    expect(body.name).toBe(payload.name);
    expect(body.type).toBe(payload.type);
    expect(body.description).toBe(payload.description);

    createdLocationId = body.id;
  });

  it('POST /api/locations with invalid data returns 400 with validation errors', async () => {
    const invalidPayload = {
      name: 'K',
      type: 'INVALID_TYPE',
    };

    const response = await request(app.getHttpServer())
      .post('/api/locations')
      .send(invalidPayload)
      .expect(400);

    expect(response.body.statusCode).toBe(400);
    expect(response.body.message).toEqual(expect.any(Array));
  });

  it('POST /api/locations accepts description at exactly 500 characters', async () => {
    const exact500 = 'a'.repeat(500);

    const response = await request(app.getHttpServer())
      .post('/api/locations')
      .send({
        name: 'Pantry Shelf',
        type: LocationType.PANTRY,
        description: exact500,
      })
      .expect(201);

    const body = response.body as LocationResponse;

    expect(body.id).toEqual(expect.any(Number));
    expect(body.description).toHaveLength(500);
    expect(body.description).toBe(exact500);
  });

  it('GET /api/locations returns the created location in the list', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/locations')
      .expect(200);

    const body = response.body as LocationResponse[];

    expect(Array.isArray(body)).toBe(true);
    expect(body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: createdLocationId,
          name: 'Kitchen',
          type: LocationType.FRIDGE,
        }),
      ]),
    );
  });

  it('GET /api/locations/:id returns a single location', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/locations/${createdLocationId}`)
      .expect(200);

    const body = response.body as LocationResponse;

    expect(body.id).toBe(createdLocationId);
    expect(body.name).toBe('Kitchen');
    expect(body.type).toBe(LocationType.FRIDGE);
  });

  it('PATCH /api/locations/:id updates a field and returns the updated location', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/api/locations/${createdLocationId}`)
      .send({ description: 'Updated description' })
      .expect(200);

    const body = response.body as LocationResponse;

    expect(body.id).toBe(createdLocationId);
    expect(body.description).toBe('Updated description');
  });

  it('DELETE /api/locations/:id deletes the location and returns 200', async () => {
    await request(app.getHttpServer())
      .delete(`/api/locations/${createdLocationId}`)
      .expect(200);
  });

  it('GET /api/locations/:id with non-existent ID returns 404', async () => {
    await request(app.getHttpServer())
      .get(`/api/locations/${createdLocationId}`)
      .expect(404);
  });
});
