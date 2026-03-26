import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from '@mikro-orm/postgresql';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { LocationType } from './enums/location-type.enum';
import { Location } from './entities/location.entity';

describe('LocationsService', () => {
  let service: LocationsService;
  const mockEm = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneOrFail: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    persistAndFlush: jest.fn(),
    removeAndFlush: jest.fn(),
    flush: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

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

  it('calls em.persistAndFlush() and returns the entity', async () => {
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
    mockEm.persistAndFlush.mockResolvedValue(undefined);

    const result = await service.create(dto);

    expect(mockEm.create).toHaveBeenCalledWith(
      Location,
      expect.objectContaining({
        name: dto.name,
        type: dto.type,
        description: dto.description,
      }),
    );
    expect(mockEm.persistAndFlush).toHaveBeenCalledWith(entity);
    expect(result).toBe(entity);
  });

  it('returns all locations when no type filter is provided', async () => {
    const locations = [
      { id: 1, name: 'Kitchen', type: LocationType.FRIDGE },
      { id: 2, name: 'Garage', type: LocationType.FREEZER },
    ];
    mockEm.find.mockResolvedValue(locations);

    const result = await service.findAll();

    expect(mockEm.find).toHaveBeenCalledWith(Location, {});
    expect(result).toEqual(locations);
  });

  it('filters by type when provided', async () => {
    const filtered = [{ id: 1, name: 'Garage', type: LocationType.FREEZER }];
    mockEm.find.mockResolvedValue(filtered);

    const result = await service.findAll({ type: LocationType.FREEZER });

    expect(mockEm.find).toHaveBeenCalledWith(Location, {
      type: LocationType.FREEZER,
    });
    expect(result).toEqual(filtered);
  });

  it('throws NotFoundException when the location does not exist', async () => {
    mockEm.findOneOrFail.mockRejectedValue(new Error('not found'));

    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    expect(mockEm.findOneOrFail).toHaveBeenCalledWith(
      Location,
      { id: 999 },
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

    const result = await service.update(1, dto);

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
    mockEm.removeAndFlush.mockResolvedValue(undefined);

    await service.remove(1);

    expect(mockEm.findOneOrFail).toHaveBeenCalledWith(
      Location,
      { id: 1 },
      { populate: ['inventoryItems', 'inventoryItems.ingredient'] },
    );
    expect(mockEm.removeAndFlush).toHaveBeenCalledWith(location);
  });

  it('throws ConflictException when inventory items still camp at this location', async () => {
    const location = {
      id: 1,
      name: 'Kitchen',
      type: LocationType.FRIDGE,
    } as Location;

    mockEm.findOneOrFail.mockResolvedValue(location);
    mockEm.count.mockResolvedValue(2);

    await expect(service.remove(1)).rejects.toThrow(ConflictException);
    expect(mockEm.removeAndFlush).not.toHaveBeenCalled();
  });
});
