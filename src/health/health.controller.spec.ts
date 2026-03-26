import { Test, TestingModule } from '@nestjs/testing';
import { MikroORM } from '@mikro-orm/postgresql';
import { ServiceUnavailableException } from '@nestjs/common';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  const mockOrm = {
    isConnected: jest.fn(),
  };

  beforeEach(async () => {
    mockOrm.isConnected.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: MikroORM,
          useValue: mockOrm,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return connected health response when database is connected', async () => {
    mockOrm.isConnected.mockResolvedValue(true);

    const result = await controller.getHealth();

    expect(mockOrm.isConnected).toHaveBeenCalledTimes(1);
    expect(result.status).toBe('ok');
    expect(result.database).toBe('connected');
    expect(typeof result.timestamp).toBe('string');
  });

  it('should throw ServiceUnavailableException when database is disconnected', async () => {
    mockOrm.isConnected.mockResolvedValue(false);

    try {
      await controller.getHealth();
      fail('Expected ServiceUnavailableException to be thrown');
    } catch (error) {
      expect(mockOrm.isConnected).toHaveBeenCalledTimes(1);
      expect(error).toBeInstanceOf(ServiceUnavailableException);

      const exception = error as ServiceUnavailableException;
      expect(exception.getStatus()).toBe(503);

      const response = exception.getResponse() as Record<string, unknown>;
      expect(response.database).toBe('disconnected');
    }
  });
});
