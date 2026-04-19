import {
  IsNotEmpty,
  IsInt,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRecipeIngredientDto {
  @ApiProperty({
    description: 'ID of the ingredient to include in the recipe',
    example: 42,
  })
  @IsInt()
  @IsPositive()
  ingredientId: number;

  @ApiProperty({
    description: 'Amount of the ingredient required',
    example: 8,
  })
  @IsNumber()
  @IsNotEmpty()
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
}
