import {
  IsString,
  IsNotEmpty,
  MaxLength,
  MinLength,
  IsNumber,
  IsPositive,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateRecipeIngredientDto } from './create-recipe-ingredient.dto';

export class CreateRecipeDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  description: string;

  @IsString()
  @IsNotEmpty()
  instructions: string;

  @IsNumber()
  @IsPositive()
  servings: number;

  @IsNumber()
  @IsPositive()
  prepTime: number;

  @IsNumber()
  @IsPositive()
  cookTime: number;

  @ValidateNested({ each: true })
  @Type(() => CreateRecipeIngredientDto)
  ingredients: CreateRecipeIngredientDto[];
}
