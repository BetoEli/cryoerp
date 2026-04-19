import { Property, Entity, ManyToOne, PrimaryKey } from '@mikro-orm/core';
import { ApiProperty } from '@nestjs/swagger';
import { Recipe } from './recipe.entity';
import { Ingredient } from '../../ingredients/entities/ingredient.entity';

@Entity()
export class RecipeIngredient {
  @ApiProperty()
  @PrimaryKey()
  id!: number;

  @ApiProperty({ type: () => Recipe })
  @ManyToOne(() => Recipe)
  recipe!: Recipe;

  @ApiProperty({ type: () => Ingredient })
  @ManyToOne(() => Ingredient)
  ingredient!: Ingredient;

  @ApiProperty()
  @Property({ type: 'number' })
  quantity!: number;

  @ApiProperty()
  @Property({ type: 'string' })
  unit!: string;
}
