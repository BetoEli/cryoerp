import { Injectable, NotFoundException } from '@nestjs/common';
import { wrap } from '@mikro-orm/core';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { EntityManager } from '@mikro-orm/postgresql';
import { Recipe } from './entities/recipe.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { RecipeIngredient } from './entities/recipe-ingredient.entity';

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

    await this.em.persist(recipe).flush();

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

  async remove(id: number) {
    const recipe = await this.em.findOne(Recipe, { id }, { populate: ['recipeIngredients'] });

    if (!recipe) {
      throw new NotFoundException(`Recipe with id ${id} not found`);
    }

    await this.em.remove(recipe).flush();
  }
}
