import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InventoryIngredientDto {
  @ApiProperty({ description: 'Ingredient ID', example: 42 })
  id: number;

  @ApiProperty({ description: 'Ingredient name', example: 'Chicken Breast' })
  name: string;
}

export class InventoryLocationDto {
  @ApiProperty({ description: 'Location ID', example: 3 })
  id: number;

  @ApiProperty({ description: 'Location name', example: 'Main Fridge' })
  name: string;
}

export class InventoryItemResponseDto {
  @ApiProperty({ description: 'Inventory item ID', example: 7 })
  id: number;

  @ApiProperty({ type: () => InventoryIngredientDto })
  ingredient: InventoryIngredientDto;

  @ApiProperty({ type: () => InventoryLocationDto })
  location: InventoryLocationDto;

  @ApiProperty({ description: 'Amount in stock', example: 16 })
  quantity: number;

  @ApiProperty({ description: 'Unit of measurement', example: 'oz' })
  unit: string;

  @ApiPropertyOptional({
    description: 'Expiration date in ISO 8601 format',
    example: new Date().toISOString(),
  })
  expirationDate?: Date;

  @ApiPropertyOptional({
    description: 'Purchase date in ISO 8601 format',
    example: new Date().toISOString(),
  })
  purchaseDate?: Date;

  @ApiPropertyOptional({
    description: 'Additional notes about the item',
    example: 'Opened Monday, use within 3 days',
  })
  notes?: string;

  @ApiProperty({
    description: 'Timestamp when the item was added',
    example: new Date().toISOString(),
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'Timestamp when the item was last updated',
    example: new Date().toISOString(),
  })
  updatedAt?: Date;
}
