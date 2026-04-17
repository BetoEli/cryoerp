import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/postgresql';
import { Public } from '../common/decorators/public.decorator';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('health')
export class HealthController {
  constructor(private readonly orm: MikroORM) {}

  @Public()
  @ApiOperation({ summary: 'Check the health of the application' })
  @ApiResponse({ status: 200, description: 'ok' })
  @ApiResponse({ status: 503, description: 'disconnected' })
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
