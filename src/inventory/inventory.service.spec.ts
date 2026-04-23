import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/postgresql';
import { NotFoundException } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { Location } from '../locations/entities/location.entity';
import { InventoryItem } from './entities/inventory.entity';

describe('InventoryService', () => {
  let service: InventoryService;
  const mockFlush = jest.fn().mockResolvedValue(undefined);
  const mockQb = {
    select: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    execute: jest.fn(),
  };

  const mockEm = {
    findOne: jest.fn(),
    create: jest.fn(),
    persist: jest.fn().mockReturnValue({ flush: mockFlush }),
    remove: jest.fn().mockReturnValue({ flush: mockFlush }),
    find: jest.fn(),
    flush: jest.fn(),
    removeAndFlush: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(mockQb),
  };

  const USER_ID = 1;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockEm.persist.mockReturnValue({ flush: mockFlush });
    mockEm.remove.mockReturnValue({ flush: mockFlush });

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

    const result = await service.create(
      {
        ingredientId: 10,
        locationId: 20,
        quantity: 2.5,
        unit: 'lbs',
        expirationDate: '2026-04-24T00:00:00Z',
      },
      USER_ID,
    );

    expect(mockEm.findOne).toHaveBeenNthCalledWith(1, Ingredient, { id: 10 });
    expect(mockEm.findOne).toHaveBeenNthCalledWith(2, Location, {
      id: 20,
      user: USER_ID,
    });
    expect(mockEm.create).toHaveBeenCalledWith(
      InventoryItem,
      expect.objectContaining({
        ingredient,
        location,
        quantity: 2.5,
        unit: 'lbs',
      }),
    );

    const createCalls = mockEm.create.mock.calls as Array<
      [typeof InventoryItem, { expirationDate?: Date }]
    >;
    const createdCall = createCalls[0][1];
    expect(createdCall.expirationDate).toBeInstanceOf(Date);
    expect(mockEm.persist).toHaveBeenCalledWith(created);
    expect(mockFlush).toHaveBeenCalled();
    expect(result).toBe(created);
  });

  it('create() throws NotFoundException when ingredient does not exist', async () => {
    mockEm.findOne.mockResolvedValueOnce(null);

    await expect(
      service.create(
        {
          ingredientId: 404,
          locationId: 20,
          quantity: 2.5,
          unit: 'lbs',
        },
        USER_ID,
      ),
    ).rejects.toThrow(NotFoundException);

    expect(mockEm.findOne).toHaveBeenCalledWith(Ingredient, { id: 404 });
  });

  it('throws NotFoundException when location does not exist', async () => {
    const ingredient = { id: 10, name: 'Chicken Breast' } as Ingredient;
    mockEm.findOne
      .mockResolvedValueOnce(ingredient)
      .mockResolvedValueOnce(null);

    await expect(
      service.create(
        {
          ingredientId: 10,
          locationId: 999,
          quantity: 2.5,
          unit: 'lbs',
        },
        USER_ID,
      ),
    ).rejects.toThrow(NotFoundException);

    expect(mockEm.findOne).toHaveBeenNthCalledWith(1, Ingredient, { id: 10 });
    expect(mockEm.findOne).toHaveBeenNthCalledWith(2, Location, {
      id: 999,
      user: USER_ID,
    });
  });

  it('populates ingredient and location', async () => {
    const rows = [{ id: 1 }, { id: 2 }] as InventoryItem[];
    mockEm.find.mockResolvedValue(rows);

    const result = await service.findAll(USER_ID);

    expect(mockEm.find).toHaveBeenCalledWith(
      InventoryItem,
      { location: { user: USER_ID } },
      { populate: ['ingredient', 'location'] },
    );
    expect(result).toEqual(rows);
  });

  it('findSummary() executes a QueryBuilder query and returns the result', async () => {
    const expected = [
      {
        locationId: 1,
        locationName: 'Kitchen Fridge',
        itemCount: 2,
        totalQuantity: 5,
        expiredCount: 1,
      },
      {
        locationId: 2,
        locationName: 'Pantry',
        itemCount: 1,
        totalQuantity: 5,
        expiredCount: 0,
      },
    ];

    mockQb.execute.mockResolvedValue(expected);

    const result = await service.findSummary(USER_ID);

    expect(mockEm.createQueryBuilder).toHaveBeenCalled();
    expect(mockQb.where).toHaveBeenCalledWith({ location: { user: USER_ID } });
    expect(mockQb.execute).toHaveBeenCalled();
    expect(result).toEqual(expected);
  });

  it('findExpiring() returns items expiring within the default window', async () => {
    const rows = [{ id: 1 }] as InventoryItem[];
    mockEm.find.mockResolvedValue(rows);

    const result = await service.findExpiring(7, USER_ID);

    const findCalls = mockEm.find.mock.calls as Array<
      [
        typeof InventoryItem,
        {
          expirationDate: { $gte: Date; $lte: Date };
          location: { user: number };
        },
        { populate: string[]; orderBy: { expirationDate: 'asc' } },
      ]
    >;
    const [entity, filter, options] = findCalls[0];

    expect(entity).toBe(InventoryItem);
    expect(filter.expirationDate.$gte).toBeInstanceOf(Date);
    expect(filter.expirationDate.$lte).toBeInstanceOf(Date);
    expect(filter.location).toEqual({ user: USER_ID });
    expect(options).toEqual({
      populate: ['ingredient', 'location'],
      orderBy: { expirationDate: 'asc' },
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

    jest.spyOn(service, 'findOne').mockResolvedValue(item);
    mockEm.findOne
      .mockResolvedValueOnce(newIngredient)
      .mockResolvedValueOnce(newLocation);
    mockEm.flush.mockResolvedValue(undefined);

    const result = await service.update(
      77,
      {
        ingredientId: 2,
        locationId: 11,
        quantity: 9,
        unit: 'lbs',
      },
      USER_ID,
    );

    expect(mockEm.findOne).toHaveBeenNthCalledWith(1, Ingredient, { id: 2 });
    expect(mockEm.findOne).toHaveBeenNthCalledWith(2, Location, {
      id: 11,
      user: USER_ID,
    });
    expect(item.ingredient).toBe(newIngredient);
    expect(item.location).toBe(newLocation);
    expect(item.quantity).toBe(9);
    expect(item.unit).toBe('lbs');
    expect(mockEm.flush).toHaveBeenCalled();
    expect(result).toBe(item);
  });

  it('finds and removes the entity', async () => {
    const item = { id: 55 } as InventoryItem;
    const findOneSpy = jest.spyOn(service, 'findOne').mockResolvedValue(item);

    await service.remove(55, USER_ID);

    expect(findOneSpy).toHaveBeenCalledWith(55, USER_ID);
    expect(mockEm.remove).toHaveBeenCalledWith(item);
    expect(mockFlush).toHaveBeenCalled();
  });
});
