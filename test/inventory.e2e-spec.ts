import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MikroORM } from '@mikro-orm/postgresql';
import request from 'supertest';
import { App } from 'supertest/types';
import helmet from 'helmet';
import { AppModule } from '../src/app.module';
import { LocationType } from '../src/locations/enums/location-type.enum';
import { IngredientCategory } from '../src/locations/enums/ingredient-category.enum';

type InventoryResponse = {
  id: number;
  ingredient: {
    id: number;
    name: string;
  };
  location: {
    id: number;
    name: string;
  };
  quantity: number;
  unit: string;
  expirationDate?: string;
};

type LocationWithInventoryResponse = {
  id: number;
  name: string;
  inventoryItems: Array<{
    id: number;
    ingredient: {
      id: number;
      name: string;
    };
  }>;
};

describe('Inventory (e2e)', () => {
  let app: INestApplication<App>;
  let orm: MikroORM;
  let locationId: number;
  let ingredientId: number;
  let inventoryId: number;

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

  it('creates a location', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/locations')
      .set('X-API-Key', 'test-api-key')
      .send({
        name: 'Kitchen Fridge',
        type: LocationType.FRIDGE,
      })
      .expect(201);

    expect(response.body.id).toEqual(expect.any(Number));
    expect(response.body.name).toBe('Kitchen Fridge');
    expect(response.body.type).toBe(LocationType.FRIDGE);

    locationId = response.body.id;
  });

  it('creates an ingredient', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/ingredients')
      .set('X-API-Key', 'test-api-key')
      .send({
        name: 'Chicken Breast',
        category: IngredientCategory.PROTEIN,
        defaultUnit: 'lbs',
      })
      .expect(201);

    expect(response.body.id).toEqual(expect.any(Number));
    expect(response.body.name).toBe('Chicken Breast');
    expect(response.body.category).toBe(IngredientCategory.PROTEIN);

    ingredientId = response.body.id;
  });

  it('creates an inventory item that links ingredient and location', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/inventory')
      .set('X-API-Key', 'test-api-key')
      .send({
        ingredientId,
        locationId,
        quantity: 2.5,
        unit: 'lbs',
        expirationDate: '2026-04-24T00:00:00Z',
      })
      .expect(201);

    const body = response.body as InventoryResponse;

    expect(body.id).toEqual(expect.any(Number));
    expect(body.quantity).toBe(2.5);
    expect(body.unit).toBe('lbs');
    expect(body.ingredient.id).toBe(ingredientId);
    expect(body.location.id).toBe(locationId);

    inventoryId = body.id;
  });

  it('gets the inventory item with populated ingredient/location names', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/inventory/${inventoryId}`)
      .set('X-API-Key', 'test-api-key')
      .expect(200);

    const body = response.body as InventoryResponse;

    expect(body.id).toBe(inventoryId);
    expect(body.ingredient.name).toBe('Chicken Breast');
    expect(body.location.name).toBe('Kitchen Fridge');
  });

  it('gets the location with inventory items and nested ingredient details', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/locations/${locationId}`)
      .set('X-API-Key', 'test-api-key')
      .expect(200);

    const body = response.body as LocationWithInventoryResponse;

    expect(body.id).toBe(locationId);
    expect(Array.isArray(body.inventoryItems)).toBe(true);
    expect(body.inventoryItems.length).toBeGreaterThan(0);
    expect(body.inventoryItems[0].ingredient.name).toBe('Chicken Breast');
  });

  it('rejects deleting the location while inventory still lives there', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/api/locations/${locationId}`)
      .set('X-API-Key', 'test-api-key')
      .expect(409);

    expect(response.body.statusCode).toBe(409);
    expect(response.body.message).toContain('Cannot delete location');
  });

  it('deletes inventory first, then location, and everyone goes home happy', async () => {
    await request(app.getHttpServer())
      .delete(`/api/inventory/${inventoryId}`)
      .set('X-API-Key', 'test-api-key')
      .expect(200);

    await request(app.getHttpServer())
      .delete(`/api/locations/${locationId}`)
      .set('X-API-Key', 'test-api-key')
      .expect(200);
  });
});
