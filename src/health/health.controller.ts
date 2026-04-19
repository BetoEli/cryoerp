import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/postgresql';
import { Public } from '../common/decorators/public.decorator';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthResponseDto } from './dto/health-response.dto';
import { ErrorResponseDto } from '../common/dto/error-response.dto';

@Controller('health')
export class HealthController {
  constructor(private readonly orm: MikroORM) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Check application and database health' })
  @ApiResponse({
    status: 200,
    description: 'Application is healthy and database is connected.',
    type: HealthResponseDto,
  })
  @ApiResponse({
    status: 503,
    description: 'Database is unreachable.',
    type: ErrorResponseDto,
  })
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
