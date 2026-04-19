import {
  Cascade,
  Collection,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { ApiProperty } from '@nestjs/swagger';
import { RecipeIngredient } from './recipe-ingredient.entity';
import { User } from '../../user/user.entity';

@Entity()
export class Recipe {
  @ApiProperty()
  @PrimaryKey()
  id!: number;

  @ApiProperty()
  @Property({ type: 'string' })
  name!: string;

  @ApiProperty()
  @Property({ type: 'string', length: 1000 })
  description!: string;

  @ApiProperty()
  @Property({ type: 'string', length: 1000 })
  instructions!: string;

  @ApiProperty()
  @Property({ type: 'number' })
  servings!: number;

  @ApiProperty({ description: 'Prep time in minutes' })
  @Property({ type: 'number' })
  prepTime!: number;

  @ApiProperty({ description: 'Cook time in minutes' })
  @Property({ type: 'number' })
  cookTime!: number;

  @ApiProperty()
  @Property({ type: 'date', onCreate: () => new Date() })
  createdAt = new Date();

  @ApiProperty()
  @Property({ type: 'date', onUpdate: () => new Date() })
  updatedAt: Date;

  @ApiProperty({ required: false, nullable: true })
  @ManyToOne(() => User, { nullable: true })
  user?: User;

  @ApiProperty({ type: () => [RecipeIngredient] })
  @OneToMany(() => RecipeIngredient, (ri) => ri.recipe, {
    cascade: [Cascade.ALL],
    orphanRemoval: true,
    serializedName: 'ingredients',
  })
  recipeIngredients = new Collection<RecipeIngredient>(this);
}
