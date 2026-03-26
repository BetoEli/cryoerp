import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MikroORM } from '@mikro-orm/postgresql';
import request from 'supertest';
import { App } from 'supertest/types';
import helmet from 'helmet';
import { AppModule } from '../src/app.module';
import { IngredientCategory } from '../src/locations/enums/ingredient-category.enum';

type IngredientResponse = {
  id: number;
  name: string;
  category: IngredientCategory;
  defaultUnit: string;
  barcode?: string;
  createdAt: string;
  updatedAt?: string;
};

describe('Ingredients (e2e)', () => {
  let app: INestApplication<App>;
  let orm: MikroORM;
  let createdIngredientId: number;

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

  it('POST /api/ingredients creates an ingredient and returns 201', async () => {
    const payload = {
      name: 'Milk',
      category: IngredientCategory.DAIRY,
      defaultUnit: 'oz',
      barcode: '12345',
    };

    const response = await request(app.getHttpServer())
      .post('/api/ingredients')
      .send(payload)
      .expect(201);

    const body = response.body as IngredientResponse;

    expect(body.id).toEqual(expect.any(Number));
    expect(body.name).toBe(payload.name);
    expect(body.category).toBe(payload.category);
    expect(body.defaultUnit).toBe(payload.defaultUnit);
    expect(body.barcode).toBe(payload.barcode);

    createdIngredientId = body.id;
  });

  it('GET /api/ingredients returns created ingredients', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/ingredients')
      .expect(200);

    const body = response.body as IngredientResponse[];

    expect(body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: createdIngredientId,
          name: 'Milk',
          category: IngredientCategory.DAIRY,
        }),
      ]),
    );
  });

  it('GET /api/ingredients/:id returns a single ingredient', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/ingredients/${createdIngredientId}`)
      .expect(200);

    const body = response.body as IngredientResponse;

    expect(body.id).toBe(createdIngredientId);
    expect(body.name).toBe('Milk');
  });

  it('PATCH /api/ingredients/:id updates and returns the ingredient', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/api/ingredients/${createdIngredientId}`)
      .send({ defaultUnit: 'cups' })
      .expect(200);

    const body = response.body as IngredientResponse;

    expect(body.id).toBe(createdIngredientId);
    expect(body.defaultUnit).toBe('cups');
  });

  it('GET /api/ingredients/barcode/:code returns ingredient by barcode', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/ingredients/barcode/12345')
      .expect(200);

    const body = response.body as IngredientResponse;

    expect(body.id).toBe(createdIngredientId);
    expect(body.barcode).toBe('12345');
  });

  it('GET /api/ingredients filters by category', async () => {
    await request(app.getHttpServer()).post('/api/ingredients').send({
      name: 'Rice',
      category: IngredientCategory.GRAIN,
      defaultUnit: 'lbs',
      barcode: '12345678',
    });

    const response = await request(app.getHttpServer())
      .get('/api/ingredients?category=DAIRY')
      .expect(200);

    const body = response.body as IngredientResponse[];

    expect(body.length).toBeGreaterThanOrEqual(1);
    expect(
      body.every((item) => item.category === IngredientCategory.DAIRY),
    ).toBe(true);
  });

  it('GET /api/ingredients filters by search string', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/ingredients?search=milk')
      .expect(200);

    const body = response.body as IngredientResponse[];

    expect(body.length).toBeGreaterThanOrEqual(1);
    expect(body.some((item) => item.name.toLowerCase().includes('milk'))).toBe(
      true,
    );
  });

  it('DELETE /api/ingredients/:id deletes the ingredient', async () => {
    await request(app.getHttpServer())
      .delete(`/api/ingredients/${createdIngredientId}`)
      .expect(200);
  });

  it('GET /api/ingredients/:id returns 404 for deleted ingredient', async () => {
    await request(app.getHttpServer())
      .get(`/api/ingredients/${createdIngredientId}`)
      .expect(404);
  });
});
