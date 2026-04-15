import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/postgresql';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { LocationType } from './enums/location-type.enum';
import { Location } from './entities/location.entity';

describe('LocationsService', () => {
  let service: LocationsService;
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

  const USER_ID = 1;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockEm.persist.mockReturnValue({ flush: mockFlush });
    mockEm.remove.mockReturnValue({ flush: mockFlush });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationsService,
        { provide: EntityManager, useValue: mockEm },
      ],
    }).compile();

    service = module.get<LocationsService>(LocationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('calls em.persist().flush() and returns the entity', async () => {
    const dto = {
      name: 'Kitchen',
      type: LocationType.FRIDGE,
      description: 'kitchen fridge',
    };
    const entity = {
      id: 1,
      ...dto,
      createdAt: new Date(),
    } as Location;

    mockEm.create.mockReturnValue(entity);

    const result = await service.create(dto, USER_ID);

    expect(mockEm.create).toHaveBeenCalledWith(
      Location,
      expect.objectContaining({
        name: dto.name,
        type: dto.type,
        description: dto.description,
        user: USER_ID,
      }),
    );
    expect(mockEm.persist).toHaveBeenCalledWith(entity);
    expect(mockFlush).toHaveBeenCalled();
    expect(result).toBe(entity);
  });

  it('returns all locations when no type filter is provided', async () => {
    const locations = [
      { id: 1, name: 'Kitchen', type: LocationType.FRIDGE },
      { id: 2, name: 'Garage', type: LocationType.FREEZER },
    ];
    mockEm.find.mockResolvedValue(locations);

    const result = await service.findAll({}, USER_ID);

    expect(mockEm.find).toHaveBeenCalledWith(Location, { user: USER_ID });
    expect(result).toEqual(locations);
  });

  it('filters by type when provided', async () => {
    const filtered = [{ id: 1, name: 'Garage', type: LocationType.FREEZER }];
    mockEm.find.mockResolvedValue(filtered);

    const result = await service.findAll({ type: LocationType.FREEZER }, USER_ID);

    expect(mockEm.find).toHaveBeenCalledWith(Location, {
      type: LocationType.FREEZER,
      user: USER_ID,
    });
    expect(result).toEqual(filtered);
  });

  it('throws NotFoundException when the location does not exist', async () => {
    mockEm.findOneOrFail.mockRejectedValue(new Error('not found'));

    await expect(service.findOne(999, USER_ID)).rejects.toThrow(NotFoundException);
    expect(mockEm.findOneOrFail).toHaveBeenCalledWith(
      Location,
      { id: 999, user: USER_ID },
      { populate: ['inventoryItems', 'inventoryItems.ingredient'] },
    );
  });

  it('applies DTO changes and flushes', async () => {
    const location = {
      id: 1,
      name: 'Kitchen',
      type: LocationType.FRIDGE,
      description: 'old',
    } as Location;
    const dto = { name: 'Kitchen Updated', description: 'new' };

    mockEm.findOneOrFail.mockResolvedValue(location);
    mockEm.flush.mockResolvedValue(undefined);

    const result = await service.update(1, dto, USER_ID);

    expect(location.name).toBe('Kitchen Updated');
    expect(location.description).toBe('new');
    expect(mockEm.flush).toHaveBeenCalled();
    expect(result).toBe(location);
  });

  it('finds and removes the entity', async () => {
    const location = {
      id: 1,
      name: 'Kitchen',
      type: LocationType.FRIDGE,
    } as Location;

    mockEm.findOneOrFail.mockResolvedValue(location);
    mockEm.count.mockResolvedValue(0);

    await service.remove(1, USER_ID);

    expect(mockEm.findOneOrFail).toHaveBeenCalledWith(
      Location,
      { id: 1, user: USER_ID },
      { populate: ['inventoryItems', 'inventoryItems.ingredient'] },
    );
    expect(mockEm.remove).toHaveBeenCalledWith(location);
    expect(mockFlush).toHaveBeenCalled();
  });

  it('throws ConflictException when inventory items still camp at this location', async () => {
    const location = {
      id: 1,
      name: 'Kitchen',
      type: LocationType.FRIDGE,
    } as Location;

    mockEm.findOneOrFail.mockResolvedValue(location);
    mockEm.count.mockResolvedValue(2);

    await expect(service.remove(1, USER_ID)).rejects.toThrow(ConflictException);
    expect(mockEm.remove).not.toHaveBeenCalled();
  });
});
