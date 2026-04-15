import { Test, TestingModule } from '@nestjs/testing';
import { RecipesService } from './recipes.service';
import { EntityManager } from '@mikro-orm/postgresql';
import { NotFoundException } from '@nestjs/common';

describe('RecipesService', () => {
  let service: RecipesService;
  const mockFlush = jest.fn().mockResolvedValue(undefined);
  let entityManager: {
    create: jest.Mock;
    findOne: jest.Mock;
    find: jest.Mock;
    persist: jest.Mock;
    persistAndFlush: jest.Mock;
    remove: jest.Mock;
    flush: jest.Mock;
  };

  const USER_ID = 1;

  beforeEach(async () => {
    entityManager = {
      create: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      persist: jest.fn().mockReturnValue({ flush: mockFlush }),
      persistAndFlush: jest.fn(),
      remove: jest.fn().mockReturnValue({ flush: mockFlush }),
      flush: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecipesService,
        {
          provide: EntityManager,
          useValue: entityManager,
        },
      ],
    }).compile();

    service = module.get<RecipesService>(RecipesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should populate recipe ingredients and their ingredients', async () => {
    entityManager.find.mockResolvedValue([]);

    await service.findAll(USER_ID);

    expect(entityManager.find).toHaveBeenCalledWith(
      expect.any(Function),
      { user: USER_ID },
      {
        populate: ['recipeIngredients', 'recipeIngredients.ingredient'],
      },
    );
  });

  it('findOne should populate recipe ingredients and their ingredients', async () => {
    entityManager.findOne.mockResolvedValue({ id: 1 });

    await service.findOne(1, USER_ID);

    expect(entityManager.findOne).toHaveBeenCalledWith(
      expect.any(Function),
      { id: 1, user: USER_ID },
      {
        populate: ['recipeIngredients', 'recipeIngredients.ingredient'],
      },
    );
  });

  it('findOne should throw when recipe does not exist', async () => {
    entityManager.findOne.mockResolvedValue(null);

    await expect(service.findOne(1, USER_ID)).rejects.toThrow(
      'Recipe with id 1 not found',
    );
  });

  it('create should persist a recipe with the correct ingredient associations', async () => {
    const mockIngredient = { id: 1, name: 'Flour' };
    const mockRecipeIngredient = { id: 10, ingredient: mockIngredient };
    const mockRecipe = {
      id: 1,
      recipeIngredients: { add: jest.fn() },
    };

    entityManager.findOne.mockResolvedValue(mockIngredient);
    entityManager.create
      .mockReturnValueOnce(mockRecipe)
      .mockReturnValueOnce(mockRecipeIngredient);

    const dto = {
      name: 'Bread',
      description: 'Simple bread',
      instructions: 'Mix and bake',
      servings: 4,
      prepTime: 10,
      cookTime: 30,
      ingredients: [{ ingredientId: 1, quantity: 2, unit: 'cups' }],
    };

    const result = await service.create(dto, USER_ID);

    expect(entityManager.findOne).toHaveBeenCalledWith(expect.any(Function), {
      id: 1,
    });
    expect(mockRecipe.recipeIngredients.add).toHaveBeenCalledWith(
      mockRecipeIngredient,
    );
    expect(entityManager.persist).toHaveBeenCalledWith(mockRecipe);
    expect(mockFlush).toHaveBeenCalled();
    expect(result).toBe(mockRecipe);
  });

  it('create should throw NotFoundException when an ingredient ID does not exist', async () => {
    entityManager.findOne.mockResolvedValue(null);
    entityManager.create.mockReturnValue({ recipeIngredients: { add: jest.fn() } });

    const dto = {
      name: 'Bread',
      description: 'Simple bread',
      instructions: 'Mix and bake',
      servings: 4,
      prepTime: 10,
      cookTime: 30,
      ingredients: [{ ingredientId: 99, quantity: 2, unit: 'cups' }],
    };

    await expect(service.create(dto, USER_ID)).rejects.toThrow(NotFoundException);
  });

  it('remove should delete the recipe and cascade its recipe ingredients', async () => {
    entityManager.findOne.mockResolvedValue({
      id: 1,
      recipeIngredients: { getItems: jest.fn().mockReturnValue([]) },
    });

    await service.remove(1, USER_ID);

    expect(entityManager.remove).toHaveBeenCalled();
    expect(mockFlush).toHaveBeenCalled();
  });
});
