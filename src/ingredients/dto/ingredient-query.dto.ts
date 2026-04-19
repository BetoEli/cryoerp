import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IngredientCategory } from '../../locations/enums/ingredient-category.enum';

export class IngredientQueryDto {
  @ApiPropertyOptional({
    description: 'Filter ingredients by food category',
    enum: IngredientCategory,
    example: IngredientCategory.DAIRY,
  })
  @IsOptional()
  @IsEnum(IngredientCategory)
  category?: IngredientCategory;

  @ApiPropertyOptional({
    description: 'Search ingredients by name (case-insensitive partial match)',
    example: 'chicken',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}
