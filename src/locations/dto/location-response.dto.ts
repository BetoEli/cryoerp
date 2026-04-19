import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LocationType } from '../enums/location-type.enum';

export class LocationResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the location',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Display name of the location',
    example: 'Main Fridge',
  })
  name: string;

  @ApiProperty({
    description: 'Category of storage location',
    enum: LocationType,
    example: LocationType.FRIDGE,
  })
  type: LocationType;

  @ApiPropertyOptional({
    description: 'Optional description of the location',
    example: 'Top shelf of the kitchen fridge',
  })
  description?: string;

  @ApiProperty({
    description: 'Timestamp when the location was created',
    example: new Date().toISOString(),
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'Timestamp when the location was last updated',
    example: new Date().toISOString(),
  })
  updatedAt?: Date;
}
