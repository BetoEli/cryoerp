import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IngredientCategory } from '../../locations/enums/ingredient-category.enum';

export class CreateIngredientDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsEnum(IngredientCategory)
  @IsNotEmpty()
  category: IngredientCategory;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(20)
  defaultUnit: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{8,14}$/)
  barcode?: string;
}
