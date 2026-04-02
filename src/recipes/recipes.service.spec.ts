import { Test, TestingModule } from '@nestjs/testing';
import { RecipesService } from './recipes.service';
import { EntityManager } from '@mikro-orm/postgresql';
import { NotFoundException } from '@nestjs/common';

describe('RecipesService', () => {
  let service: RecipesService;
  let entityManager: {
    create: jest.Mock;
    findOne: jest.Mock;
    find: jest.Mock;
    persistAndFlush: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    entityManager = {
      create: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      persistAndFlush: jest.fn(),
      remove: jest.fn(),
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

    await service.findAll();

    expect(entityManager.find).toHaveBeenCalledWith(
      expect.any(Function),
      {},
      {
        populate: ['recipeIngredients', 'recipeIngredients.ingredient'],
      },
    );
  });

  it('findOne should populate recipe ingredients and their ingredients', async () => {
    entityManager.findOne.mockResolvedValue({ id: 1 });

    await service.findOne(1);

    expect(entityManager.findOne).toHaveBeenCalledWith(
      expect.any(Function),
      { id: 1 },
      {
        populate: ['recipeIngredients', 'recipeIngredients.ingredient'],
      },
    );
  });

  it('findOne should throw when recipe does not exist', async () => {
    entityManager.findOne.mockResolvedValue(null);

    await expect(service.findOne(1)).rejects.toThrow(
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
    entityManager.persistAndFlush.mockResolvedValue(undefined);

    const dto = {
      name: 'Bread',
      description: 'Simple bread',
      instructions: 'Mix and bake',
      servings: 4,
      prepTime: 10,
      cookTime: 30,
      ingredients: [{ ingredientId: 1, quantity: 2, unit: 'cups' }],
    };

    const result = await service.create(dto);

    expect(entityManager.findOne).toHaveBeenCalledWith(expect.any(Function), {
      id: 1,
    });
    expect(mockRecipe.recipeIngredients.add).toHaveBeenCalledWith(
      mockRecipeIngredient,
    );
    expect(entityManager.persistAndFlush).toHaveBeenCalledWith(mockRecipe);
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

    await expect(service.create(dto)).rejects.toThrow(NotFoundException);
  });

  it('remove should delete the recipe and cascade its recipe ingredients', async () => {
    const flush = jest.fn().mockResolvedValue(undefined);
    entityManager.remove.mockReturnValue({ flush });
    entityManager.findOne.mockResolvedValue({
      id: 1,
      recipeIngredients: { getItems: jest.fn().mockReturnValue([]) },
    });

    await service.remove(1);

    expect(entityManager.remove).toHaveBeenCalled();
    expect(flush).toHaveBeenCalled();
  });
});
