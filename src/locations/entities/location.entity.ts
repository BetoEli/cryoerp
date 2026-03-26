import {
  Collection,
  Entity,
  Enum,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { InventoryItem } from '../../inventory/entities/inventory.entity';
import { LocationType } from '../enums/location-type.enum';

@Entity()
export class Location {
  @PrimaryKey()
  id!: number;

  @Property({ type: 'string' })
  name!: string;

  @Property({ type: 'string', length: 500, nullable: true })
  description?: string;

  @Enum(() => LocationType)
  type!: LocationType;

  @OneToMany(() => InventoryItem, (item) => item.location)
  inventoryItems = new Collection<InventoryItem>(this);

  @Property({ type: 'date', onCreate: () => new Date() })
  createdAt = new Date();

  @Property({ type: 'date', onUpdate: () => new Date(), nullable: true })
  updatedAt?: Date;
}
