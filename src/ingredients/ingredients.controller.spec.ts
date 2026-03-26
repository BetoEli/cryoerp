import { Test, TestingModule } from '@nestjs/testing';
import { IngredientsController } from './ingredients.controller';
import { IngredientsService } from './ingredients.service';
import { IngredientCategory } from '../locations/enums/ingredient-category.enum';

describe('IngredientsController', () => {
  let controller: IngredientsController;
  const mockIngredientsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByBarcode: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngredientsController],
      providers: [
        {
          provide: IngredientsService,
          useValue: mockIngredientsService,
        },
      ],
    }).compile();

    controller = module.get<IngredientsController>(IngredientsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create() delegates to service.create()', async () => {
    const dto = {
      name: 'Salt',
      category: IngredientCategory.GRAIN,
      defaultUnit: 'cups',
      barcode: '1234',
    };
    const created = { id: 1, ...dto };
    mockIngredientsService.create.mockResolvedValue(created);

    const result = await controller.create(dto);

    expect(mockIngredientsService.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(created);
  });

  it('calls service.findAll()', async () => {
    const query = { category: IngredientCategory.DAIRY, search: 'milk' };
    const resultList = [
      { id: 2, name: 'Milk', category: IngredientCategory.DAIRY },
    ];
    mockIngredientsService.findAll.mockResolvedValue(resultList);

    const result = await controller.findAll(query);

    expect(mockIngredientsService.findAll).toHaveBeenCalledWith(query);
    expect(result).toEqual(resultList);
  });

  it('calls service.findByBarcode()', async () => {
    const ingredient = {
      id: 3,
      name: 'Yogurt',
      category: IngredientCategory.DAIRY,
      barcode: '123456',
    };
    mockIngredientsService.findByBarcode.mockResolvedValue(ingredient);

    const result = await controller.findByBarcode('123456');

    expect(mockIngredientsService.findByBarcode).toHaveBeenCalledWith('123456');
    expect(result).toEqual(ingredient);
  });

  it('calls service.findOne()', async () => {
    const ingredient = {
      id: 4,
      name: 'Pepper',
      category: IngredientCategory.SPICE,
    };
    mockIngredientsService.findOne.mockResolvedValue(ingredient);

    const result = await controller.findOne('4');

    expect(mockIngredientsService.findOne).toHaveBeenCalledWith(4);
    expect(result).toEqual(ingredient);
  });

  it('calls service.update() with numeric id and dto', async () => {
    const dto = { defaultUnit: 'lbs' };
    const updated = {
      id: 5,
      name: 'Rice',
      category: IngredientCategory.GRAIN,
      defaultUnit: 'lbs',
    };
    mockIngredientsService.update.mockResolvedValue(updated);

    const result = await controller.update('5', dto);

    expect(mockIngredientsService.update).toHaveBeenCalledWith(5, dto);
    expect(result).toEqual(updated);
  });

  it('calls service.remove() with numeric id', async () => {
    mockIngredientsService.remove.mockResolvedValue(undefined);

    const result = await controller.remove('6');

    expect(mockIngredientsService.remove).toHaveBeenCalledWith(6);
    expect(result).toBeUndefined();
  });
});
