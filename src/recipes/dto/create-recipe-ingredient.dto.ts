import {
  IsNotEmpty,
  IsInt,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateRecipeIngredientDto {
  @IsInt()
  @IsPositive()
  ingredientId: number;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  quantity: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(20)
  unit: string;
}
