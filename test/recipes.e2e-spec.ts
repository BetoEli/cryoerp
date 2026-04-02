import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MikroORM } from '@mikro-orm/postgresql';
import request from 'supertest';
import { App } from 'supertest/types';
import helmet from 'helmet';
import { AppModule } from '../src/app.module';
import { IngredientCategory } from '../src/locations/enums/ingredient-category.enum';

const API_KEY = 'test-api-key';

describe('Recipes (e2e)', () => {
  let app: INestApplication<App>;
  let orm: MikroORM;
  let ingredientId: number;
  let recipeId: number;

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

  it('creates an ingredient to use in the recipe', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/ingredients')
      .set('X-API-Key', API_KEY)
      .send({
        name: 'Flour',
        category: IngredientCategory.GRAIN,
        defaultUnit: 'cups',
      })
      .expect(201);

    expect(response.body.id).toEqual(expect.any(Number));
    ingredientId = response.body.id;
  });

  it('creates a recipe referencing the ingredient and returns populated data', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/recipes')
      .set('X-API-Key', API_KEY)
      .send({
        name: 'Simple Bread',
        description: 'Basic bread recipe',
        instructions: 'Mix and bake',
        servings: 4,
        prepTime: 10,
        cookTime: 30,
        ingredients: [{ ingredientId, quantity: 2, unit: 'cups' }],
      })
      .expect(201);

    expect(response.body.id).toEqual(expect.any(Number));
    expect(response.body.name).toBe('Simple Bread');
    expect(Array.isArray(response.body.recipeIngredients)).toBe(true);
    expect(response.body.recipeIngredients.length).toBe(1);

    recipeId = response.body.id;
  });

  it('GET /api/recipes/:id returns the full recipe with ingredients', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/recipes/${recipeId}`)
      .set('X-API-Key', API_KEY)
      .expect(200);

    expect(response.body.id).toBe(recipeId);
    expect(Array.isArray(response.body.recipeIngredients)).toBe(true);
    expect(response.body.recipeIngredients[0].ingredient.name).toBe('Flour');
  });

  it('creating a recipe with a non-existent ingredient ID returns 404', async () => {
    await request(app.getHttpServer())
      .post('/api/recipes')
      .set('X-API-Key', API_KEY)
      .send({
        name: 'Ghost Recipe',
        description: 'Uses a missing ingredient',
        instructions: 'Good luck',
        servings: 1,
        prepTime: 5,
        cookTime: 5,
        ingredients: [{ ingredientId: 99999, quantity: 1, unit: 'cups' }],
      })
      .expect(404);
  });

  it('DELETE /api/recipes/:id removes the recipe', async () => {
    await request(app.getHttpServer())
      .delete(`/api/recipes/${recipeId}`)
      .set('X-API-Key', API_KEY)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/api/recipes/${recipeId}`)
      .set('X-API-Key', API_KEY)
      .expect(404);
  });
});
