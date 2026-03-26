import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/postgresql';
import { NotFoundException } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { Location } from '../locations/entities/location.entity';
import { InventoryItem } from './entities/inventory.entity';

describe('InventoryService', () => {
  let service: InventoryService;
  const mockEm = {
    findOne: jest.fn(),
    create: jest.fn(),
    persistAndFlush: jest.fn(),
    findAll: jest.fn(),
    flush: jest.fn(),
    removeAndFlush: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: EntityManager,
          useValue: mockEm,
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('hooks up ingredient and location, then persists the snack stash', async () => {
    const ingredient = { id: 10, name: 'Chicken Breast' } as Ingredient;
    const location = { id: 20, name: 'Kitchen Fridge' } as Location;
    const created = {
      id: 1,
      ingredient,
      location,
      quantity: 2.5,
      unit: 'lbs',
    } as InventoryItem;

    mockEm.findOne
      .mockResolvedValueOnce(ingredient)
      .mockResolvedValueOnce(location);
    mockEm.create.mockReturnValue(created);
    mockEm.persistAndFlush.mockResolvedValue(undefined);

    const result = await service.create({
      ingredientId: 10,
      locationId: 20,
      quantity: 2.5,
      unit: 'lbs',
      expirationDate: '2026-04-24T00:00:00Z',
    });

    expect(mockEm.findOne).toHaveBeenNthCalledWith(1, Ingredient, { id: 10 });
    expect(mockEm.findOne).toHaveBeenNthCalledWith(2, Location, { id: 20 });
    expect(mockEm.create).toHaveBeenCalledWith(
      InventoryItem,
      expect.objectContaining({
        ingredient,
        location,
        quantity: 2.5,
        unit: 'lbs',
        expirationDate: expect.any(Date),
      }),
    );
    expect(mockEm.persistAndFlush).toHaveBeenCalledWith(created);
    expect(result).toBe(created);
  });

  it('create() throws NotFoundException when ingredient does not exist', async () => {
    mockEm.findOne.mockResolvedValueOnce(null);

    await expect(
      service.create({
        ingredientId: 404,
        locationId: 20,
        quantity: 2.5,
        unit: 'lbs',
      }),
    ).rejects.toThrow(NotFoundException);

    expect(mockEm.findOne).toHaveBeenCalledWith(Ingredient, { id: 404 });
  });

  it('throws NotFoundException when location does not exist', async () => {
    const ingredient = { id: 10, name: 'Chicken Breast' } as Ingredient;
    mockEm.findOne
      .mockResolvedValueOnce(ingredient)
      .mockResolvedValueOnce(null);

    await expect(
      service.create({
        ingredientId: 10,
        locationId: 999,
        quantity: 2.5,
        unit: 'lbs',
      }),
    ).rejects.toThrow(NotFoundException);

    expect(mockEm.findOne).toHaveBeenNthCalledWith(1, Ingredient, { id: 10 });
    expect(mockEm.findOne).toHaveBeenNthCalledWith(2, Location, { id: 999 });
  });

  it('populates ingredient and location', async () => {
    const rows = [{ id: 1 }, { id: 2 }] as InventoryItem[];
    mockEm.findAll.mockResolvedValue(rows);

    const result = await service.findAll();

    expect(mockEm.findAll).toHaveBeenCalledWith(InventoryItem, {
      populate: ['ingredient', 'location'],
    });
    expect(result).toEqual(rows);
  });

  it('resolves new references when ingredientId or locationId changes', async () => {
    const oldIngredient = { id: 1, name: 'Old Thing' } as Ingredient;
    const newIngredient = { id: 2, name: 'New Thing' } as Ingredient;
    const oldLocation = { id: 10, name: 'Old Shelf' } as Location;
    const newLocation = { id: 11, name: 'New Shelf' } as Location;
    const item = {
      id: 77,
      ingredient: oldIngredient,
      location: oldLocation,
      quantity: 1,
      unit: 'kg',
    } as InventoryItem;

    jest
      .spyOn(service, 'findOne')
      .mockResolvedValue(item);
    mockEm.findOne
      .mockResolvedValueOnce(newIngredient)
      .mockResolvedValueOnce(newLocation);
    mockEm.flush.mockResolvedValue(undefined);

    const result = await service.update(77, {
      ingredientId: 2,
      locationId: 11,
      quantity: 9,
      unit: 'lbs',
    });

    expect(mockEm.findOne).toHaveBeenNthCalledWith(1, Ingredient, { id: 2 });
    expect(mockEm.findOne).toHaveBeenNthCalledWith(2, Location, { id: 11 });
    expect(item.ingredient).toBe(newIngredient);
    expect(item.location).toBe(newLocation);
    expect(item.quantity).toBe(9);
    expect(item.unit).toBe('lbs');
    expect(mockEm.flush).toHaveBeenCalled();
    expect(result).toBe(item);
  });

  it('finds and removes the entity', async () => {
    const item = { id: 55 } as InventoryItem;
    jest.spyOn(service, 'findOne').mockResolvedValue(item);
    mockEm.removeAndFlush.mockResolvedValue(undefined);

    await service.remove(55);

    expect(service.findOne).toHaveBeenCalledWith(55);
    expect(mockEm.removeAndFlush).toHaveBeenCalledWith(item);
  });
});
