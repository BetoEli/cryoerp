import { Property, Entity, ManyToOne, PrimaryKey } from '@mikro-orm/core';
import { Recipe } from './recipe.entity';
import { Ingredient } from '../../ingredients/entities/ingredient.entity';

@Entity()
export class RecipeIngredient {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => Recipe)
  recipe!: Recipe;

  @ManyToOne(() => Ingredient)
  ingredient!: Ingredient;

  @Property({ type: 'number' })
  quantity!: number;

  @Property({ type: 'string' })
  unit!: string;
}
