import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';
import { Ingredient } from '../../ingredients/entities/ingredient.entity';
import { Location } from '../../locations/entities/location.entity';

@Entity()
export class InventoryItem {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => Ingredient)
  ingredient!: Ingredient;

  @ManyToOne(() => Location)
  location!: Location;

  @IsPositive()
  @Property({ type: 'number' })
  quantity!: number;

  @IsString()
  @IsNotEmpty()
  @Property({ type: 'string' })
  unit!: string;

  @IsOptional()
  @Property({ type: 'date', nullable: true })
  expirationDate?: Date;

  @IsOptional()
  @Property({ type: 'date', nullable: true })
  purchaseDate?: Date;

  @IsOptional()
  @IsString()
  @Property({ type: 'string', nullable: true })
  notes?: string;

  @Property({ type: 'date', onCreate: () => new Date() })
  createdAt = new Date();

  @Property({ type: 'date', onUpdate: () => new Date(), nullable: true })
  updatedAt?: Date;
}
