import {
  Collection,
  Entity,
  Enum,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { ApiProperty } from '@nestjs/swagger';
import { InventoryItem } from '../../inventory/entities/inventory.entity';
import { LocationType } from '../enums/location-type.enum';
import { User } from '../../user/user.entity';

@Entity()
export class Location {
  @ApiProperty()
  @PrimaryKey()
  id!: number;

  @ApiProperty()
  @Property({ type: 'string' })
  name!: string;

  @ApiProperty({ required: false, nullable: true })
  @Property({ type: 'string', length: 500, nullable: true })
  description?: string;

  @ApiProperty({ enum: LocationType })
  @Enum(() => LocationType)
  type!: LocationType;

  @ApiProperty({ required: false, nullable: true })
  @ManyToOne(() => User, { nullable: true })
  user?: User;

  @ApiProperty({ type: () => [InventoryItem] })
  @OneToMany(() => InventoryItem, (item) => item.location)
  inventoryItems = new Collection<InventoryItem>(this);

  @ApiProperty()
  @Property({ type: 'date', onCreate: () => new Date() })
  createdAt = new Date();

  @ApiProperty({ required: false, nullable: true })
  @Property({ type: 'date', onUpdate: () => new Date(), nullable: true })
  updatedAt?: Date;
}
