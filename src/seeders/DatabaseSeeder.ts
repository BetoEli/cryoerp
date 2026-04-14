import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import { IngredientSeeder } from './IngredientSeeder';
import { InventorySeeder } from './InventorySeeder';
import { LocationSeeder } from './LocationSeeder';
import { RecipeSeeder } from './RecipeSeeder';

export class DatabaseSeeder extends Seeder {
  run(em: EntityManager): Promise<void> {
    return this.call(em, [
      LocationSeeder,
      IngredientSeeder,
      InventorySeeder,
      RecipeSeeder,
    ] as unknown as Array<new () => Seeder>);
  }
}
