import { IsEnum, IsISO8601, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MaintenanceMode } from '../maintenance-state';

export class SetMaintenanceStatusDto {
  @ApiProperty({
    description: 'Target maintenance mode',
    enum: MaintenanceMode,
    example: MaintenanceMode.SCHEDULED,
  })
  @IsEnum(MaintenanceMode)
  mode: MaintenanceMode;

  @ApiPropertyOptional({
    description: 'Human-readable reason for the maintenance or schedule',
    example: 'Database migration and index rebuild',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;

  @ApiPropertyOptional({
    description: 'ISO 8601 datetime when scheduled maintenance will begin',
    example: new Date().toISOString(),
  })
  @IsOptional()
  @IsISO8601()
  scheduledStartTime?: string;
}
