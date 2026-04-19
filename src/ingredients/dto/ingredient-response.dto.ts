import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IngredientCategory } from '../../locations/enums/ingredient-category.enum';

export class IngredientResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the ingredient',
    example: 42,
  })
  id: number;

  @ApiProperty({
    description: 'Name of the ingredient',
    example: 'Chicken Breast',
  })
  name: string;

  @ApiProperty({
    description: 'Food category the ingredient belongs to',
    enum: IngredientCategory,
    example: IngredientCategory.PROTEIN,
  })
  category: IngredientCategory;

  @ApiProperty({
    description: 'Default unit of measurement for this ingredient',
    example: 'oz',
  })
  defaultUnit: string;

  @ApiPropertyOptional({
    description: 'Barcode associated with the ingredient packaging',
    example: '0123456789',
  })
  barcode?: string;

  @ApiProperty({
    description: 'Timestamp when the ingredient was created',
    example: new Date().toISOString(),
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'Timestamp when the ingredient was last updated',
    example: new Date().toISOString(),
  })
  updatedAt?: Date;
}
