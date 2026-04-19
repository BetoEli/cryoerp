import { ApiProperty } from '@nestjs/swagger';

export class ShoppingListItemDto {
  @ApiProperty()
  ingredientId: number;

  @ApiProperty()
  ingredientName: string;

  @ApiProperty()
  required: number;

  @ApiProperty()
  available: number;

  @ApiProperty()
  needed: number;

  @ApiProperty()
  unit: string;
}

export class ShoppingListResponseDto {
  @ApiProperty()
  recipeId: number;

  @ApiProperty()
  recipeName: string;

  @ApiProperty({ type: () => [ShoppingListItemDto] })
  items: ShoppingListItemDto[];
}
