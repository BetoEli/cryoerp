import {
  IsString,
  IsNotEmpty,
  MaxLength,
  MinLength,
  IsInt,
  IsPositive,
  Min,
  ValidateNested,
  IsArray,
  ArrayMinSize,
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

  @IsInt()
  @IsPositive()
  servings: number;

  @IsInt()
  @Min(0)
  prepTime: number;

  @IsInt()
  @Min(0)
  cookTime: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateRecipeIngredientDto)
  ingredients: CreateRecipeIngredientDto[];
}
