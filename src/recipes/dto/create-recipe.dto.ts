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
import { ApiProperty } from '@nestjs/swagger';
import { CreateRecipeIngredientDto } from './create-recipe-ingredient.dto';

export class CreateRecipeDto {
  @ApiProperty({
    description: 'Name of the recipe',
    example: 'Grilled Chicken Salad',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Short description of the recipe',
    example: 'A light and healthy salad with grilled chicken breast',
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  description: string;

  @ApiProperty({
    description: 'Step-by-step cooking instructions',
    example: '1. Season the chicken. 2. Grill for 6 minutes per side. 3. Slice and serve over greens.',
  })
  @IsString()
  @IsNotEmpty()
  instructions: string;

  @ApiProperty({
    description: 'Number of servings the recipe produces',
    example: 2,
  })
  @IsInt()
  @IsPositive()
  servings: number;

  @ApiProperty({
    description: 'Preparation time in minutes',
    example: 10,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  prepTime: number;

  @ApiProperty({
    description: 'Cooking time in minutes',
    example: 20,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  cookTime: number;

  @ApiProperty({
    description: 'List of ingredients required for the recipe',
    type: () => [CreateRecipeIngredientDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateRecipeIngredientDto)
  ingredients: CreateRecipeIngredientDto[];
}
