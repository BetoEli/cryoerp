import type { Dictionary } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { Seeder } from '@mikro-orm/seeder';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { Recipe } from '../recipes/entities/recipe.entity';
import { RecipeIngredient } from '../recipes/entities/recipe-ingredient.entity';

export class RecipeSeeder extends Seeder<Dictionary> {
  async run(em: EntityManager, context: Dictionary): Promise<void> {
    if (
      !context.snack ||
      !context.cheese ||
      !context.pepper ||
      !context.rice ||
      !context.chicken
    ) {
      throw new Error(
        'RecipeSeeder requires ingredient references in context.',
      );
    }

    const snack = context.snack as Ingredient;
    const cheese = context.cheese as Ingredient;
    const pepper = context.pepper as Ingredient;
    const rice = context.rice as Ingredient;
    const chicken = context.chicken as Ingredient;

    const chickenStirFry = em.create(Recipe, {
      name: 'Chicken Stir Fry',
      description: 'High macro meal with chicken and rice',
      instructions: 'Cook chicken and rice together with some veggies',
      servings: 4,
      prepTime: 20,
      cookTime: 15,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    em.create(RecipeIngredient, {
      recipe: chickenStirFry,
      ingredient: chicken,
      quantity: 12,
      unit: 'oz',
    });
    em.create(RecipeIngredient, {
      recipe: chickenStirFry,
      ingredient: rice,
      quantity: 1,
      unit: 'lb',
    });
    em.create(RecipeIngredient, {
      recipe: chickenStirFry,
      ingredient: pepper,
      quantity: 1,
      unit: 'each',
    });

    const oreoCheesecake = em.create(Recipe, {
      name: 'Oreo Cheesecake',
      description: 'Oreo cookies with cheese',
      instructions: 'Cut oreos and fill with cheese',
      servings: 8,
      prepTime: 25,
      cookTime: 60,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    em.create(RecipeIngredient, {
      recipe: oreoCheesecake,
      ingredient: snack,
      quantity: 2,
      unit: 'pack',
    });
    em.create(RecipeIngredient, {
      recipe: oreoCheesecake,
      ingredient: cheese,
      quantity: 8,
      unit: 'oz',
    });

    await em.flush();
  }
}
