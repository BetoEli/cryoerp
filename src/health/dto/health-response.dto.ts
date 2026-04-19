import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({
    description: 'Overall health status of the application',
    example: 'ok',
  })
  status: string;

  @ApiProperty({
    description: 'Database connectivity status',
    example: 'connected',
  })
  database: string;

  @ApiProperty({
    description: 'ISO 8601 timestamp of when the health check was performed',
    example: new Date().toISOString(),
  })
  timestamp: string;
}
