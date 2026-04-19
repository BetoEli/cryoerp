import { Entity, Enum, PrimaryKey, Property } from '@mikro-orm/core';
import { IsNotEmpty, IsOptional, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IngredientCategory } from '../../locations/enums/ingredient-category.enum';

@Entity()
export class Ingredient {
  @ApiProperty()
  @PrimaryKey()
  id!: number;

  @ApiProperty()
  @MinLength(2)
  @MaxLength(100)
  @Property({ type: 'string' })
  name!: string;

  @ApiProperty({ enum: IngredientCategory })
  @Enum(() => IngredientCategory)
  category!: IngredientCategory;

  @ApiProperty()
  @IsNotEmpty()
  @Property({ type: 'string' })
  defaultUnit!: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @Property({ type: 'string', nullable: true, unique: true })
  barcode?: string;

  @ApiProperty()
  @Property({ type: 'date', onCreate: () => new Date() })
  createdAt = new Date();

  @ApiProperty({ required: false, nullable: true })
  @Property({ type: 'date', onUpdate: () => new Date(), nullable: true })
  updatedAt?: Date;
}
