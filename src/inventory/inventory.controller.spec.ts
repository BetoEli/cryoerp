import { Test, TestingModule } from '@nestjs/testing';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import type { JwtPayload } from '../common/interfaces/jwt-payload.interface';
import { Role } from '../user/role.enum';

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

  const mockUser: JwtPayload = { id: 1, email: 'test@test.com', role: Role.USER };

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

  it('calls service.create with the request body and user id', async () => {
    const dto = {
      ingredientId: 1,
      locationId: 2,
      quantity: 3,
      unit: 'lbs',
    };
    const created = { id: 99, ...dto };
    service.create.mockResolvedValue(created);

    const result = await controller.create(dto, mockUser);

    expect(service.create).toHaveBeenCalledWith(dto, mockUser.id);
    expect(result).toEqual(created);
  });

  it('calls service.findAll with user id', async () => {
    const rows = [{ id: 1 }, { id: 2 }];
    service.findAll.mockResolvedValue(rows);

    const result = await controller.findAll(mockUser);

    expect(service.findAll).toHaveBeenCalledWith(mockUser.id);
    expect(result).toEqual(rows);
  });

  it('calls service.findSummary with user id', async () => {
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

    const result = await controller.summary(mockUser);

    expect(service.findSummary).toHaveBeenCalledWith(mockUser.id);
    expect(result).toEqual(rows);
  });

  it('calls service.findExpiring with days and user id', async () => {
    const rows = [{ id: 1 }];
    service.findExpiring.mockResolvedValue(rows);

    const result = await controller.findExpiring(7, mockUser);

    expect(service.findExpiring).toHaveBeenCalledWith(7, mockUser.id);
    expect(result).toEqual(rows);
  });

  it('parses id and calls service.findOne with user id', async () => {
    const row = { id: 7 };
    service.findOne.mockResolvedValue(row);

    const result = await controller.findOne('7', mockUser);

    expect(service.findOne).toHaveBeenCalledWith(7, mockUser.id);
    expect(result).toEqual(row);
  });

  it('parses id and calls service.update with dto and user id', async () => {
    const dto = { quantity: 8 };
    const updated = { id: 7, quantity: 8 };
    service.update.mockResolvedValue(updated);

    const result = await controller.update('7', dto, mockUser);

    expect(service.update).toHaveBeenCalledWith(7, dto, mockUser.id);
    expect(result).toEqual(updated);
  });

  it('parses id and calls service.remove with user id', async () => {
    service.remove.mockResolvedValue(undefined);

    await controller.remove('7', mockUser);

    expect(service.remove).toHaveBeenCalledWith(7, mockUser.id);
  });
});
