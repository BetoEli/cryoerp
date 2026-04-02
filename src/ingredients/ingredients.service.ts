import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager, FilterQuery } from '@mikro-orm/postgresql';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { IngredientQueryDto } from './dto/ingredient-query.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { Ingredient } from './entities/ingredient.entity';
import { InventoryItem } from '../inventory/entities/inventory.entity';
import { RecipeIngredient } from '../recipes/entities/recipe-ingredient.entity';

@Injectable()
export class IngredientsService {
  constructor(private readonly em: EntityManager) {}

  async create(createIngredientDto: CreateIngredientDto) {
    const date = new Date();

    const ingredient = this.em.create(Ingredient, {
      ...createIngredientDto,
      createdAt: date,
      updatedAt: date,
    });

    await this.em.persistAndFlush(ingredient);
    return ingredient;
  }

  async findAll(query?: IngredientQueryDto) {
    const filter: FilterQuery<Ingredient> = {
      ...(query?.category ? { category: query.category } : {}),
      ...(query?.search ? { name: { $ilike: `%${query.search}%` } } : {}),
    };

    return this.em.find(Ingredient, filter);
  }

  async findByBarcode(code: string) {
    const ingredient = await this.em.findOne(Ingredient, { barcode: code });
    if (!ingredient) {
      throw new NotFoundException(`Ingredient with barcode ${code} not found`);
    }

    return ingredient;
  }

  async findOne(id: number) {
    const ingredient = await this.em.findOne(Ingredient, { id });
    if (!ingredient) {
      throw new NotFoundException(`Ingredient with id ${id} not found`);
    }

    return ingredient;
  }

  async update(id: number, updateIngredientDto: UpdateIngredientDto) {
    const ingredient = await this.findOne(id);
    Object.assign(ingredient, updateIngredientDto);
    await this.em.flush();

    return ingredient;
  }

  async remove(id: number) {
    const ingredient = await this.findOne(id);

    const inventoryCount = await this.em.count(InventoryItem, {
      ingredient: { id },
    });
    if (inventoryCount > 0) {
      throw new ConflictException(
        'Cannot delete ingredient: inventory items still reference it',
      );
    }

    const recipeIngredientCount = await this.em.count(RecipeIngredient, {
      ingredient: { id },
    });
    if (recipeIngredientCount > 0) {
      throw new ConflictException(
        'Cannot delete ingredient: recipes still reference it',
      );
    }

    await this.em.removeAndFlush(ingredient);
  }
}
