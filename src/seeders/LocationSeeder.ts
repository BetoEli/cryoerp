import type { Dictionary } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { Seeder } from '@mikro-orm/seeder';
import { Location } from '../locations/entities/location.entity';
import { LocationType } from '../locations/enums/location-type.enum';

export class LocationSeeder extends Seeder<Dictionary> {
  run(em: EntityManager, context: Dictionary): void {
    const admin = context.adminUser;

    context.fridge = em.create(Location, {
      name: 'Fridge',
      description: 'Primary refrigerator in the kitchen',
      type: LocationType.FRIDGE,
      user: admin,
      createdAt: new Date(),
    });

    context.freezer = em.create(Location, {
      name: 'Freezer',
      description: 'Primary freezer in the kitchen',
      type: LocationType.FREEZER,
      user: admin,
      createdAt: new Date(),
    });

    context.pantry = em.create(Location, {
      name: 'Pantry',
      description: 'Dry storage area for non-perishable items',
      type: LocationType.PANTRY,
      user: admin,
      createdAt: new Date(),
    });
  }
}
