import type { Dictionary } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { Seeder } from '@mikro-orm/seeder';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { InventoryItem } from '../inventory/entities/inventory.entity';
import { Location } from '../locations/entities/location.entity';

export class InventorySeeder extends Seeder<Dictionary> {
  async run(em: EntityManager, context: Dictionary): Promise<void> {
    if (
      !context.fridge ||
      !context.freezer ||
      !context.pantry ||
      !context.cheese ||
      !context.pepper ||
      !context.rice ||
      !context.chicken ||
      !context.apple
    ) {
      throw new Error(
        'InventorySeeder requires location and ingredient references in context.',
      );
    }

    const fridge = context.fridge as Location;
    const freezer = context.freezer as Location;
    const pantry = context.pantry as Location;

    const cheese = context.cheese as Ingredient;
    const pepper = context.pepper as Ingredient;
    const rice = context.rice as Ingredient;
    const chicken = context.chicken as Ingredient;
    const apple = context.apple as Ingredient;

    em.create(InventoryItem, {
      ingredient: cheese,
      location: fridge,
      quantity: 16,
      unit: 'oz',
      expirationDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      purchaseDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      notes: 'Someone forgot to cut the cheese',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    em.create(InventoryItem, {
      ingredient: pepper,
      location: pantry,
      quantity: 1,
      unit: 'each',
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      purchaseDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      notes: 'Almost out of pepper',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    em.create(InventoryItem, {
      ingredient: rice,
      location: pantry,
      quantity: 2,
      unit: 'lb',
      expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      purchaseDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      notes: 'Almost out of rice',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    em.create(InventoryItem, {
      ingredient: chicken,
      location: freezer,
      quantity: 32,
      unit: 'oz',
      expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      purchaseDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      notes: 'Plenty of chicken',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    em.create(InventoryItem, {
      ingredient: apple,
      location: fridge,
      quantity: 5,
      unit: 'each',
      expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      purchaseDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      notes: 'Fresh apples',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await em.flush();
  }
}
