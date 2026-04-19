import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Ingredient } from '../../ingredients/entities/ingredient.entity';
import { Location } from '../../locations/entities/location.entity';

@Entity()
export class InventoryItem {
  @ApiProperty()
  @PrimaryKey()
  id!: number;

  @ApiProperty({ type: () => Ingredient })
  @ManyToOne(() => Ingredient)
  ingredient!: Ingredient;

  @ApiProperty({ type: () => Location })
  @ManyToOne(() => Location)
  location!: Location;

  @ApiProperty()
  @IsPositive()
  @Property({ type: 'number' })
  quantity!: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Property({ type: 'string' })
  unit!: string;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @Property({ type: 'date', nullable: true })
  expirationDate?: Date;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @Property({ type: 'date', nullable: true })
  purchaseDate?: Date;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsString()
  @Property({ type: 'string', nullable: true })
  notes?: string;

  @ApiProperty()
  @Property({ type: 'date', onCreate: () => new Date() })
  createdAt = new Date();

  @ApiProperty({ required: false, nullable: true })
  @Property({ type: 'date', onUpdate: () => new Date(), nullable: true })
  updatedAt?: Date;
}
