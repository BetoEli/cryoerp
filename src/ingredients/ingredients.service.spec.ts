import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/postgresql';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { IngredientsService } from './ingredients.service';
import { IngredientCategory } from '../locations/enums/ingredient-category.enum';
import { Ingredient } from './entities/ingredient.entity';

describe('IngredientsService', () => {
  let service: IngredientsService;
  const mockFlush = jest.fn().mockResolvedValue(undefined);
  const mockEm = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneOrFail: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    persist: jest.fn().mockReturnValue({ flush: mockFlush }),
    remove: jest.fn().mockReturnValue({ flush: mockFlush }),
    flush: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockEm.persist.mockReturnValue({ flush: mockFlush });
    mockEm.remove.mockReturnValue({ flush: mockFlush });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngredientsService,
        {
          provide: EntityManager,
          useValue: mockEm,
        },
      ],
    }).compile();

    service = module.get<IngredientsService>(IngredientsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create() persists and returns the entity', async () => {
    const dto = {
      name: 'Salt',
      category: IngredientCategory.SPICE,
      defaultUnit: 'cups',
      barcode: '1234',
    };
    const entity = {
      id: 1,
      ...dto,
      createdAt: new Date(),
    } as Ingredient;

    mockEm.create.mockReturnValue(entity);

    const result = await service.create(dto);

    expect(mockEm.create).toHaveBeenCalledWith(
      Ingredient,
      expect.objectContaining({
        name: dto.name,
        category: dto.category,
        defaultUnit: dto.defaultUnit,
        barcode: dto.barcode,
      }),
    );
    expect(mockEm.persist).toHaveBeenCalledWith(entity);
    expect(mockFlush).toHaveBeenCalled();
    expect(result).toBe(entity);
  });

  it('filters by category and search string when provided', async () => {
    const filtered = [
      {
        id: 1,
        name: 'Milk',
        category: IngredientCategory.DAIRY,
      },
    ];
    mockEm.find.mockResolvedValue(filtered);

    const result = await service.findAll({
      category: IngredientCategory.DAIRY,
      search: 'milk',
    });

    expect(mockEm.find).toHaveBeenCalledWith(Ingredient, {
      category: IngredientCategory.DAIRY,
      name: { $ilike: '%milk%' },
    });
    expect(result).toEqual(filtered);
  });

  it('findByBarcode() returns the correct ingredient', async () => {
    const ingredient = {
      id: 7,
      name: 'Sugar',
      category: IngredientCategory.OTHER,
      defaultUnit: 'oz',
      barcode: '123456',
    } as Ingredient;
    mockEm.findOne.mockResolvedValue(ingredient);

    const result = await service.findByBarcode('123456');

    expect(mockEm.findOne).toHaveBeenCalledWith(Ingredient, {
      barcode: '123456',
    });
    expect(result).toBe(ingredient);
  });

  it('findByBarcode() throws NotFoundException when ingredient does not exist', async () => {
    mockEm.findOne.mockResolvedValue(null);

    await expect(service.findByBarcode('999')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('remove() finds and removes the entity', async () => {
    const ingredient = {
      id: 2,
      name: 'Cheese',
      category: IngredientCategory.DAIRY,
      defaultUnit: 'oz',
    } as Ingredient;
    mockEm.findOne.mockResolvedValue(ingredient);
    mockEm.count.mockResolvedValueOnce(0).mockResolvedValueOnce(0);

    await service.remove(2);

    expect(mockEm.findOne).toHaveBeenCalledWith(Ingredient, { id: 2 });
    expect(mockEm.remove).toHaveBeenCalledWith(ingredient);
    expect(mockFlush).toHaveBeenCalled();
  });

  it('throws ConflictException when inventory items still depend on the ingredient', async () => {
    const ingredient = {
      id: 2,
      name: 'Cheese',
      category: IngredientCategory.DAIRY,
      defaultUnit: 'oz',
    } as Ingredient;

    mockEm.findOne.mockResolvedValue(ingredient);
    mockEm.count.mockResolvedValue(1);

    await expect(service.remove(2)).rejects.toThrow(ConflictException);
    expect(mockEm.remove).not.toHaveBeenCalled();
  });

  it('throws ConflictException when recipes still depend on the ingredient', async () => {
    const ingredient = {
      id: 2,
      name: 'Cheese',
      category: IngredientCategory.DAIRY,
      defaultUnit: 'oz',
    } as Ingredient;

    mockEm.findOne.mockResolvedValue(ingredient);
    mockEm.count.mockResolvedValueOnce(0).mockResolvedValueOnce(1);

    await expect(service.remove(2)).rejects.toThrow(ConflictException);
    expect(mockEm.remove).not.toHaveBeenCalled();
  });
});
