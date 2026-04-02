import { Injectable, NotFoundException } from '@nestjs/common';
import { raw, wrap } from '@mikro-orm/core';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { EntityManager } from '@mikro-orm/postgresql';
import { Recipe } from './entities/recipe.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { RecipeIngredient } from './entities/recipe-ingredient.entity';
import { InventoryItem } from '../inventory/entities/inventory.entity';

export interface AvailableRecipe {
  id: number;
  name: string;
  servings: number;
  prepTime: number;
  cookTime: number;
  ingredientCount: number;
}

@Injectable()
export class RecipesService {
  constructor(private readonly em: EntityManager) {}

  async create(createRecipeDto: CreateRecipeDto) {
    const date = new Date();
    const recipe = this.em.create(Recipe, {
      name: createRecipeDto.name,
      description: createRecipeDto.description,
      instructions: createRecipeDto.instructions,
      servings: createRecipeDto.servings,
      prepTime: createRecipeDto.prepTime,
      cookTime: createRecipeDto.cookTime,
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

    await this.em.persistAndFlush(recipe);

    return recipe;
  }

  async findAll() {
    return this.em.find(
      Recipe,
      {},
      {
        populate: ['recipeIngredients', 'recipeIngredients.ingredient'],
      },
    );
  }

  async findOne(id: number) {
    const recipe = await this.em.findOne(
      Recipe,
      { id },
      {
        populate: ['recipeIngredients', 'recipeIngredients.ingredient'],
      },
    );

    if (!recipe) {
      throw new NotFoundException(`Recipe with id ${id} not found`);
    }

    return recipe;
  }

  async update(id: number, dto: UpdateRecipeDto) {
    const recipe = await this.em.findOne(
      Recipe,
      { id },
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

  async findAvailable(): Promise<AvailableRecipe[]> {
    return this.em
      .createQueryBuilder(Recipe, 'r')
      .select(['r.id', 'r.name', 'r.servings', 'r.prepTime', 'r.cookTime'])
      .addSelect(raw('count(ri.id) as "ingredientCount"'))
      .join('r.recipeIngredients', 'ri')
      .groupBy('r.id')
      .having(
        raw(`count(ri.id) = sum(case when coalesce((
          select sum(ii.quantity) from inventory_item ii
          where ii.ingredient_id = ri.ingredient_id
        ), 0) >= ri.quantity then 1 else 0 end)`),
      )
      .execute() as Promise<AvailableRecipe[]>;
  }

  private async calculateIngredientAvailability(id: number) {
    const recipe = await this.findOne(id);

    const ingredientIds = recipe.recipeIngredients
      .getItems()
      .map((ri: RecipeIngredient) => ri.ingredient.id);

    const inventoryItems = await this.em.find(InventoryItem, {
      ingredient: { $in: ingredientIds },
    });

    const availableMap = new Map<number, number>();
    for (const item of inventoryItems) {
      const ingId = item.ingredient.id;
      const current = availableMap.get(ingId) ?? 0;
      availableMap.set(ingId, current + item.quantity);
    }

    return { recipe, availableMap };
  }

  async checkAvailability(id: number) {
    const { recipe, availableMap } =
      await this.calculateIngredientAvailability(id);

    const ingredients = recipe.recipeIngredients
      .getItems()
      .map((ri: RecipeIngredient) => {
        const available = availableMap.get(ri.ingredient.id) ?? 0;
        return {
          ingredientId: ri.ingredient.id,
          ingredientName: ri.ingredient.name,
          required: ri.quantity,
          available,
          sufficient: available >= ri.quantity,
        };
      });

    return {
      recipeId: recipe.id,
      recipeName: recipe.name,
      ingredients,
      canMake: ingredients.every((i) => i.sufficient),
    };
  }

  async getShoppingList(id: number) {
    const { recipe, availableMap } =
      await this.calculateIngredientAvailability(id);

    const items = recipe.recipeIngredients
      .getItems()
      .filter((ri: RecipeIngredient) => {
        const available = availableMap.get(ri.ingredient.id) ?? 0;
        return available < ri.quantity;
      })
      .map((ri: RecipeIngredient) => {
        const available = availableMap.get(ri.ingredient.id) ?? 0;
        return {
          ingredientId: ri.ingredient.id,
          ingredientName: ri.ingredient.name,
          required: ri.quantity,
          available,
          needed: ri.quantity - available,
          unit: ri.unit,
        };
      });

    return {
      recipeId: recipe.id,
      recipeName: recipe.name,
      items,
    };
  }

  async remove(id: number) {
    const recipe = await this.em.findOne(
      Recipe,
      { id },
      { populate: ['recipeIngredients'] },
    );

    if (!recipe) {
      throw new NotFoundException(`Recipe with id ${id} not found`);
    }

    await this.em.remove(recipe).flush();
  }
}
