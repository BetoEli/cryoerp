import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RecipeIngredientResponseDto {
  @ApiProperty({ description: 'Recipe ingredient entry ID', example: 1 })
  id: number;

  @ApiProperty({ description: 'Ingredient ID', example: 42 })
  ingredientId: number;

  @ApiProperty({ description: 'Ingredient name', example: 'Chicken Breast' })
  ingredientName: string;

  @ApiProperty({ description: 'Amount required', example: 8 })
  quantity: number;

  @ApiProperty({ description: 'Unit of measurement', example: 'oz' })
  unit: string;
}

export class RecipeResponseDto {
  @ApiProperty({ description: 'Recipe ID', example: 5 })
  id: number;

  @ApiProperty({ description: 'Recipe name', example: 'Grilled Chicken Salad' })
  name: string;

  @ApiProperty({
    description: 'Short description of the recipe',
    example: 'A light and healthy salad with grilled chicken breast',
  })
  description: string;

  @ApiProperty({
    description: 'Step-by-step cooking instructions',
    example: '1. Season the chicken. 2. Grill for 6 minutes per side. 3. Serve over greens.',
  })
  instructions: string;

  @ApiProperty({ description: 'Number of servings', example: 2 })
  servings: number;

  @ApiProperty({ description: 'Preparation time in minutes', example: 10 })
  prepTime: number;

  @ApiProperty({ description: 'Cooking time in minutes', example: 20 })
  cookTime: number;

  @ApiProperty({
    description: 'Ingredients required for this recipe',
    type: () => [RecipeIngredientResponseDto],
  })
  ingredients: RecipeIngredientResponseDto[];

  @ApiProperty({
    description: 'Timestamp when the recipe was created',
    example: new Date().toISOString(),
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'Timestamp when the recipe was last updated',
    example: new Date().toISOString(),
  })
  updatedAt?: Date;
}
