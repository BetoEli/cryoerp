import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

describe('InventoryController', () => {
  let controller: InventoryController;
  let service: {
    create: jest.Mock;
    findAll: jest.Mock;
    findSummary: jest.Mock;
    findExpiring: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findSummary: jest.fn(),
    findExpiring: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [
        {
          provide: InventoryService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<InventoryController>(InventoryController);
    service = module.get(InventoryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('calls service.create with the request body', async () => {
    const dto = {
      ingredientId: 1,
      locationId: 2,
      quantity: 3,
      unit: 'lbs',
    };
    const created = { id: 99, ...dto };
    service.create.mockResolvedValue(created);

    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(created);
  });

  it('calls service.findAll', async () => {
    const rows = [{ id: 1 }, { id: 2 }];
    service.findAll.mockResolvedValue(rows);

    const result = await controller.findAll();

    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual(rows);
  });

  it('calls service.findSummary', async () => {
    const rows = [
      {
        locationId: 1,
        locationName: 'Kitchen Fridge',
        itemCount: 12,
        totalQuantity: 45,
        expiredCount: 2,
      },
    ];
    service.findSummary.mockResolvedValue(rows);

    const controllerWithSummary = controller as {
      summary: () => Promise<typeof rows>;
    };

    const result = await controllerWithSummary.summary();

    expect(service.findSummary).toHaveBeenCalled();
    expect(result).toEqual(rows);
  });

  it('calls service.findExpiring with default days', async () => {
    const rows = [{ id: 1 }];
    service.findExpiring.mockResolvedValue(rows);

    const controllerWithFindExpiring = controller as {
      findExpiring: (days: number) => Promise<typeof rows>;
    };

    const result = await controllerWithFindExpiring.findExpiring(7);

    expect(service.findExpiring).toHaveBeenCalledWith(7);
    expect(result).toEqual(rows);
  });

  it('parses id and calls service.findOne', async () => {
    const row = { id: 7 };
    service.findOne.mockResolvedValue(row);

    const result = await controller.findOne('7');

    expect(service.findOne).toHaveBeenCalledWith(7);
    expect(result).toEqual(row);
  });

  it('parses id and calls service.update with dto', async () => {
    const dto = { quantity: 8 };
    const updated = { id: 7, quantity: 8 };
    service.update.mockResolvedValue(updated);

    const result = await controller.update('7', dto);

    expect(service.update).toHaveBeenCalledWith(7, dto);
    expect(result).toEqual(updated);
  });

  it('parses id and calls service.remove', async () => {
    service.remove.mockResolvedValue(undefined);

    await controller.remove('7');

    expect(service.remove).toHaveBeenCalledWith(7);
  });
});
