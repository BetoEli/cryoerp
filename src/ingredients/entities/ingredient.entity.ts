import { Entity, Enum, PrimaryKey, Property } from '@mikro-orm/core';
import { IsNotEmpty, IsOptional, MaxLength, MinLength } from 'class-validator';
import { IngredientCategory } from '../../locations/enums/ingredient-category.enum';

@Entity()
export class Ingredient {
  @PrimaryKey()
  id!: number;

  @MinLength(2)
  @MaxLength(100)
  @Property({ type: 'string' })
  name!: string;

  @Enum(() => IngredientCategory)
  category!: IngredientCategory;

  @IsNotEmpty()
  @Property({ type: 'string' })
  defaultUnit!: string;

  @IsOptional()
  @Property({ type: 'string', nullable: true, unique: true })
  barcode?: string;

  @Property({ type: 'date', onCreate: () => new Date() })
  createdAt = new Date();

  @Property({ type: 'date', onUpdate: () => new Date(), nullable: true })
  updatedAt?: Date;
}
