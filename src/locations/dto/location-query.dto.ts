import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { LocationType } from '../enums/location-type.enum';

export class LocationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter locations by storage type',
    enum: LocationType,
    example: LocationType.FREEZER,
  })
  @IsOptional()
  @IsEnum(LocationType)
  type?: LocationType;
}
