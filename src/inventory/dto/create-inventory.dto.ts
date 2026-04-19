import { Type } from 'class-transformer';
import {
  IsISO8601,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInventoryItemDto {
  @ApiProperty({
    description: 'ID of the ingredient being stored',
    example: 42,
  })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  ingredientId: number;

  @ApiProperty({
    description: 'ID of the storage location',
    example: 3,
  })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  locationId: number;

  @ApiProperty({
    description: 'Amount of the ingredient currently in stock',
    example: 1.5,
  })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  quantity: number;

  @ApiProperty({
    description: 'Unit of measurement for the quantity',
    example: 'oz',
    minLength: 1,
    maxLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(20)
  unit: string;

  @ApiPropertyOptional({
    description: 'Expiration date in ISO 8601 format',
    example: new Date().toISOString(),
  })
  @IsOptional()
  @IsISO8601()
  expirationDate?: string;

  @ApiPropertyOptional({
    description: 'Date the item was purchased, in ISO 8601 format',
    example: new Date().toISOString(),
  })
  @IsOptional()
  @IsISO8601()
  purchaseDate?: string;

  @ApiPropertyOptional({
    description: 'Any additional notes about this inventory item',
    example: 'Opened on Monday, use within 3 days',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class CreateInventoryDto extends CreateInventoryItemDto {}
