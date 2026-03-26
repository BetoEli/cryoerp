import { Test, TestingModule } from '@nestjs/testing';
import { LocationsController } from './locations.controller';
import { LocationsService } from './locations.service';
import { LocationType } from './enums/location-type.enum';

describe('LocationsController', () => {
  let controller: LocationsController;
  const mockLocationsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocationsController],
      providers: [
        {
          provide: LocationsService,
          useValue: mockLocationsService,
        },
      ],
    }).compile();

    controller = module.get<LocationsController>(LocationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('calls service.create() and returns the service result', async () => {
    const dto = {
      name: 'Kitchen',
      type: LocationType.FRIDGE,
      description: 'Kitchen fridge',
    };
    const created = { id: 1, ...dto };
    mockLocationsService.create.mockResolvedValue(created);

    const result = await controller.create(dto);

    expect(mockLocationsService.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(created);
  });

  it('calls service.findAll() with query and returns the service result', async () => {
    const query = { type: LocationType.FREEZER };
    const locations = [{ id: 1, name: 'Garage', type: LocationType.FREEZER }];
    mockLocationsService.findAll.mockResolvedValue(locations);

    const result = await controller.findAll(query);

    expect(mockLocationsService.findAll).toHaveBeenCalledWith(query);
    expect(result).toEqual(locations);
  });

  it('converts id to number, calls service.findOne(), and returns the service result', async () => {
    const location = { id: 2, name: 'Pantry', type: LocationType.PANTRY };
    mockLocationsService.findOne.mockResolvedValue(location);

    const result = await controller.findOne('2');

    expect(mockLocationsService.findOne).toHaveBeenCalledWith(2);
    expect(result).toEqual(location);
  });

  it('converts id to number, calls service.update(), and returns the service result', async () => {
    const dto = { name: 'Updated Name' };
    const updated = {
      id: 3,
      name: 'Updated Name',
      type: LocationType.CABINET,
    };
    mockLocationsService.update.mockResolvedValue(updated);

    const result = await controller.update('3', dto);

    expect(mockLocationsService.update).toHaveBeenCalledWith(3, dto);
    expect(result).toEqual(updated);
  });

  it('converts id to number, calls service.remove(), and passes through the return value', async () => {
    mockLocationsService.remove.mockResolvedValue(undefined);

    const result = await controller.remove('4');

    expect(mockLocationsService.remove).toHaveBeenCalledWith(4);
    expect(result).toBeUndefined();
  });
});
