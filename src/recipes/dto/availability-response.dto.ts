import { ApiProperty } from '@nestjs/swagger';

export class AvailabilityIngredientDto {
  @ApiProperty()
  ingredientId: number;

  @ApiProperty()
  ingredientName: string;

  @ApiProperty()
  required: number;

  @ApiProperty()
  requiredUnit: string;

  @ApiProperty()
  available: number;

  @ApiProperty()
  sufficient: boolean;
}

export class AvailabilityResponseDto {
  @ApiProperty()
  recipeId: number;

  @ApiProperty()
  recipeName: string;

  @ApiProperty({ type: () => [AvailabilityIngredientDto] })
  ingredients: AvailabilityIngredientDto[];

  @ApiProperty()
  canMake: boolean;
}
