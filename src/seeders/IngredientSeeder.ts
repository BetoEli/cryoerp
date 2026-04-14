import type { Dictionary } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { Seeder } from '@mikro-orm/seeder';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { IngredientCategory } from '../locations/enums/ingredient-category.enum';

export class IngredientSeeder extends Seeder<Dictionary> {
  run(em: EntityManager, context: Dictionary): void {
    context.snack = em.create(Ingredient, {
      name: 'Oreo Cookies',
      defaultUnit: 'pack',
      category: IngredientCategory.SNACK,
      barcode: '123456789',
      createdAt: new Date(),
    });

    context.cheese = em.create(Ingredient, {
      name: 'Mozzarella Cheese',
      defaultUnit: 'oz',
      category: IngredientCategory.DAIRY,
      barcode: '987654321',
      createdAt: new Date(),
    });

    context.pepper = em.create(Ingredient, {
      name: 'Pepper',
      defaultUnit: 'each',
      category: IngredientCategory.SPICE,
      barcode: '555555555',
      createdAt: new Date(),
    });

    context.rice = em.create(Ingredient, {
      name: 'Rice',
      defaultUnit: 'lb',
      category: IngredientCategory.GRAIN,
      barcode: '111111111',
      createdAt: new Date(),
    });

    context.chicken = em.create(Ingredient, {
      name: 'Chicken',
      defaultUnit: 'oz',
      category: IngredientCategory.PROTEIN,
      barcode: '222222222',
      createdAt: new Date(),
    });

    context.apple = em.create(Ingredient, {
      name: 'Granny Smith Apple',
      defaultUnit: 'each',
      category: IngredientCategory.FRUIT,
      barcode: '333333333',
      createdAt: new Date(),
    });
  }
}
