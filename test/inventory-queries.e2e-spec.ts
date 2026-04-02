import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MikroORM } from '@mikro-orm/postgresql';
import request from 'supertest';
import { App } from 'supertest/types';
import helmet from 'helmet';
import { AppModule } from '../src/app.module';
import { LocationType } from '../src/locations/enums/location-type.enum';
import { IngredientCategory } from '../src/locations/enums/ingredient-category.enum';

const API_KEY = 'test-api-key';

describe('Inventory Intelligence (e2e)', () => {
  let app: INestApplication<App>;
  let orm: MikroORM;
  let locationId: number;
  let ingredientId: number;

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

  it('seeds a location and ingredient', async () => {
    const locRes = await request(app.getHttpServer())
      .post('/api/locations')
      .set('X-API-Key', API_KEY)
      .send({ name: 'Pantry', type: LocationType.PANTRY })
      .expect(201);
    locationId = locRes.body.id;

    const ingRes = await request(app.getHttpServer())
      .post('/api/ingredients')
      .set('X-API-Key', API_KEY)
      .send({
        name: 'Butter',
        category: IngredientCategory.DAIRY,
        defaultUnit: 'oz',
      })
      .expect(201);
    ingredientId = ingRes.body.id;
  });

  it('creates an inventory item expiring in 3 days and one expiring in 30 days', async () => {
    const soon = new Date();
    soon.setDate(soon.getDate() + 3);

    const later = new Date();
    later.setDate(later.getDate() + 30);

    await request(app.getHttpServer())
      .post('/api/inventory')
      .set('X-API-Key', API_KEY)
      .send({
        ingredientId,
        locationId,
        quantity: 1,
        unit: 'oz',
        expirationDate: soon.toISOString(),
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/inventory')
      .set('X-API-Key', API_KEY)
      .send({
        ingredientId,
        locationId,
        quantity: 2,
        unit: 'oz',
        expirationDate: later.toISOString(),
      })
      .expect(201);
  });

  it('GET /api/inventory/expiring?days=7 returns only the item expiring within 7 days', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/inventory/expiring?days=7')
      .set('X-API-Key', API_KEY)
      .expect(200);

    const body = response.body as Array<{ quantity: number }>;

    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(1);
    expect(body[0].quantity).toBe(1);
  });
});
