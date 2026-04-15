import {
  Cascade,
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { RecipeIngredient } from './recipe-ingredient.entity';
import { User } from '../../user/user.entity';

@Entity()
export class Recipe {
  @PrimaryKey()
  id!: number;

  @Property({ type: 'string' })
  name!: string;

  @Property({ type: 'string', length: 1000 })
  description!: string;

  @Property({ type: 'string', length: 1000 })
  instructions!: string;

  @Property({ type: 'number' })
  servings!: number;

  @Property({ type: 'number' })
  prepTime!: number;

  @Property({ type: 'number' })
  cookTime!: number;

  @Property({ type: 'date', onCreate: () => new Date() })
  createdAt = new Date();

  @Property({ type: 'date', onUpdate: () => new Date() })
  updatedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  user?: User;

  @OneToMany(() => RecipeIngredient, (ri) => ri.recipe, {
    cascade: [Cascade.ALL],
    orphanRemoval: true,
    serializedName: 'ingredients',
  })
  recipeIngredients = new Collection<RecipeIngredient>(this);
}
