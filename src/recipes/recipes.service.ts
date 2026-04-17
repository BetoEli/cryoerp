import { Injectable, NotFoundException } from '@nestjs/common';
import { wrap } from '@mikro-orm/core';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { EntityManager } from '@mikro-orm/postgresql';
import { Recipe } from './entities/recipe.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { RecipeIngredient } from './entities/recipe-ingredient.entity';
import { InventoryItem } from '../inventory/entities/inventory.entity';

@Injectable()
export class RecipesService {
  constructor(private readonly em: EntityManager) {}

  async create(createRecipeDto: CreateRecipeDto, userId: number) {
    const date = new Date();
    const recipe = this.em.create(Recipe, {
      name: createRecipeDto.name,
      description: createRecipeDto.description,
      instructions: createRecipeDto.instructions,
      servings: createRecipeDto.servings,
      prepTime: createRecipeDto.prepTime,
      cookTime: createRecipeDto.cookTime,
      user: userId,
      createdAt: date,
      updatedAt: date,
    });

    for (const recipeIngredientDto of createRecipeDto.ingredients) {
      const ingredient = await this.em.findOne(Ingredient, {
        id: recipeIngredientDto.ingredientId,
      });

      if (!ingredient) {
        throw new NotFoundException(
          `Ingredient with id ${recipeIngredientDto.ingredientId} not found`,
        );
      }

      const recipeIngredient = this.em.create(RecipeIngredient, {
        recipe,
        ingredient,
        quantity: recipeIngredientDto.quantity,
        unit: recipeIngredientDto.unit,
      });

      recipe.recipeIngredients.add(recipeIngredient);
    }

    await this.em.persist(recipe).flush();

    return recipe;
  }

  async findAll(userId: number) {
    return this.em.find(
      Recipe,
      { user: userId },
      {
        populate: ['recipeIngredients', 'recipeIngredients.ingredient'],
      },
    );
  }

  async findOne(id: number, userId: number) {
    const recipe = await this.em.findOne(
      Recipe,
      { id, user: userId },
      {
        populate: ['recipeIngredients', 'recipeIngredients.ingredient'],
      },
    );

    if (!recipe) {
      throw new NotFoundException(`Recipe with id ${id} not found`);
    }

    return recipe;
  }

  async update(id: number, dto: UpdateRecipeDto, userId: number) {
    const recipe = await this.em.findOne(
      Recipe,
      { id, user: userId },
      { populate: ['recipeIngredients'] },
    );

    if (!recipe) {
      throw new NotFoundException(`Recipe with id ${id} not found`);
    }

    wrap(recipe).assign(
      {
        name: dto.name,
        description: dto.description,
        instructions: dto.instructions,
        servings: dto.servings,
        prepTime: dto.prepTime,
        cookTime: dto.cookTime,
      },
      { ignoreUndefined: true },
    );

    if (dto.ingredients !== undefined) {
      recipe.recipeIngredients.removeAll();

      for (const recipeIngredientDto of dto.ingredients) {
        const ingredient = await this.em.findOne(Ingredient, {
          id: recipeIngredientDto.ingredientId,
        });

        if (!ingredient) {
          throw new NotFoundException(
            `Ingredient with id ${recipeIngredientDto.ingredientId} not found`,
          );
        }

        const recipeIngredient = this.em.create(RecipeIngredient, {
          recipe,
          ingredient,
          quantity: recipeIngredientDto.quantity,
          unit: recipeIngredientDto.unit,
        });

        recipe.recipeIngredients.add(recipeIngredient);
      }
    }

    await this.em.flush();

    return recipe;
  }

  async remove(id: number, userId: number) {
    const recipe = await this.em.findOne(
      Recipe,
      { id, user: userId },
      { populate: ['recipeIngredients'] },
    );

    if (!recipe) {
      throw new NotFoundException(`Recipe with id ${id} not found`);
    }

    await this.em.remove(recipe).flush();
  }

  async checkAvailability(id: number, userId: number) {
    const recipe = await this.em.findOne(
      Recipe,
      { id, user: userId },
      { populate: ['recipeIngredients', 'recipeIngredients.ingredient'] },
    );

    if (!recipe) {
      throw new NotFoundException(`Recipe with id ${id} not found`);
    }

    const ingredients: Array<{
      ingredientId: number;
      ingredientName: string;
      required: number;
      requiredUnit: string;
      available: number;
      sufficient: boolean;
    }> = [];

    for (const ri of recipe.recipeIngredients) {
      const items = await this.em.find(InventoryItem, {
        ingredient: ri.ingredient,
        location: { user: userId },
      });
      const available = items.reduce((sum, item) => sum + item.quantity, 0);

      ingredients.push({
        ingredientId: ri.ingredient.id,
        ingredientName: ri.ingredient.name,
        required: ri.quantity,
        requiredUnit: ri.unit,
        available,
        sufficient: available >= ri.quantity,
      });
    }

    return {
      recipeId: recipe.id,
      recipeName: recipe.name,
      ingredients,
      canMake: ingredients.every((i) => i.sufficient),
    };
  }

  async getShoppingList(id: number, userId: number) {
    const recipe = await this.em.findOne(
      Recipe,
      { id, user: userId },
      { populate: ['recipeIngredients', 'recipeIngredients.ingredient'] },
    );

    if (!recipe) {
      throw new NotFoundException(`Recipe with id ${id} not found`);
    }

    const items: Array<{
      ingredientId: number;
      ingredientName: string;
      required: number;
      available: number;
      needed: number;
      unit: string;
    }> = [];

    for (const ri of recipe.recipeIngredients) {
      const inventoryItems = await this.em.find(InventoryItem, {
        ingredient: ri.ingredient,
        location: { user: userId },
      });
      const available = inventoryItems.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      const needed = ri.quantity - available;

      if (needed > 0) {
        items.push({
          ingredientId: ri.ingredient.id,
          ingredientName: ri.ingredient.name,
          required: ri.quantity,
          available,
          needed,
          unit: ri.unit,
        });
      }
    }

    return { recipeId: recipe.id, recipeName: recipe.name, items };
  }

  async findAvailable(userId: number) {
    const recipes = await this.em.find(
      Recipe,
      { user: userId },
      { populate: ['recipeIngredients', 'recipeIngredients.ingredient'] },
    );

    const available: Recipe[] = [];

    for (const recipe of recipes) {
      let canMake = true;

      for (const ri of recipe.recipeIngredients) {
        const items = await this.em.find(InventoryItem, {
          ingredient: ri.ingredient,
          location: { user: userId },
        });
        const totalAvailable = items.reduce(
          (sum, item) => sum + item.quantity,
          0,
        );

        if (totalAvailable < ri.quantity) {
          canMake = false;
          break;
        }
      }

      if (canMake) {
        available.push(recipe);
      }
    }

    return available;
  }
}
