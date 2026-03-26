import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/postgresql';

@Controller('health')
export class HealthController {
  constructor(private readonly orm: MikroORM) {}

  @Get()
  async getHealth() {
    const isDatabaseConnected = await this.orm.isConnected();
    const timestamp = new Date().toISOString();

    if (!isDatabaseConnected) {
      throw new ServiceUnavailableException({
        status: 'error',
        database: 'disconnected',
        timestamp,
      });
    }

    return {
      status: 'ok',
      database: 'connected',
      timestamp,
    };
  }
}
