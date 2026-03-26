import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { IngredientCategory } from '../../locations/enums/ingredient-category.enum';

export class IngredientQueryDto {
  @IsOptional()
  @IsEnum(IngredientCategory)
  category?: IngredientCategory;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}