import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MaintenanceMode } from '../maintenance-state';

export class MaintenanceStatusResponseDto {
  @ApiProperty({
    description: 'Current maintenance mode',
    enum: MaintenanceMode,
    example: MaintenanceMode.NORMAL,
  })
  mode: MaintenanceMode;

  @ApiPropertyOptional({
    description: 'Human-readable reason for the maintenance or schedule',
    example: 'Database migration and index rebuild',
  })
  reason?: string;

  @ApiPropertyOptional({
    description: 'ISO 8601 datetime when scheduled maintenance will begin',
    example: new Date().toISOString(),
  })
  scheduledStartTime?: string;

  @ApiProperty({
    description: 'ISO 8601 timestamp of the last status change',
    example: new Date().toISOString(),
  })
  updatedAt: string;
}
