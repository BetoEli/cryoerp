import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { CreateInventoryItemDto } from './dto/create-inventory.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory.dto';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { Location } from '../locations/entities/location.entity';
import { InventoryItem } from './entities/inventory.entity';

@Injectable()
export class InventoryService {
  constructor(private readonly em: EntityManager) {}

  async create(createInventoryDto: CreateInventoryItemDto) {
    const ingredient = await this.em.findOne(Ingredient, {
      id: createInventoryDto.ingredientId,
    });
    if (!ingredient) {
      throw new NotFoundException(
        `Ingredient with id ${createInventoryDto.ingredientId} not found`,
      );
    }

    const location = await this.em.findOne(Location, {
      id: createInventoryDto.locationId,
    });
    if (!location) {
      throw new NotFoundException(
        `Location with id ${createInventoryDto.locationId} not found`,
      );
    }

    const date = new Date();

    const inventoryItem = this.em.create(InventoryItem, {
      ingredient,
      location,
      quantity: createInventoryDto.quantity,
      unit: createInventoryDto.unit,
      expirationDate: createInventoryDto.expirationDate
        ? new Date(createInventoryDto.expirationDate)
        : undefined,
      purchaseDate: createInventoryDto.purchaseDate
        ? new Date(createInventoryDto.purchaseDate)
        : undefined,
      notes: createInventoryDto.notes,
      createdAt: date,
      updatedAt: date,
    });

    await this.em.persistAndFlush(inventoryItem);
    return inventoryItem;
  }

  async findAll() {
    return this.em.findAll(InventoryItem, {
      populate: ['ingredient', 'location'],
    });
  }

  async findOne(id: number) {
    const item = await this.em.findOne(
      InventoryItem,
      { id },
      { populate: ['ingredient', 'location'] },
    );
    if (!item) {
      throw new NotFoundException(`Inventory item with id ${id} not found`);
    }

    return item;
  }

  async update(id: number, updateInventoryDto: UpdateInventoryItemDto) {
    const item = await this.findOne(id);

    if (
      updateInventoryDto.ingredientId !== undefined &&
      updateInventoryDto.ingredientId !== item.ingredient.id
    ) {
      const ingredient = await this.em.findOne(Ingredient, {
        id: updateInventoryDto.ingredientId,
      });
      if (!ingredient) {
        throw new NotFoundException(
          `Ingredient with id ${updateInventoryDto.ingredientId} not found`,
        );
      }
      item.ingredient = ingredient;
    }

    if (
      updateInventoryDto.locationId !== undefined &&
      updateInventoryDto.locationId !== item.location.id
    ) {
      const location = await this.em.findOne(Location, {
        id: updateInventoryDto.locationId,
      });
      if (!location) {
        throw new NotFoundException(
          `Location with id ${updateInventoryDto.locationId} not found`,
        );
      }
      item.location = location;
    }

    if (updateInventoryDto.quantity !== undefined) {
      item.quantity = updateInventoryDto.quantity;
    }

    if (updateInventoryDto.unit !== undefined) {
      item.unit = updateInventoryDto.unit;
    }

    if (updateInventoryDto.expirationDate !== undefined) {
      item.expirationDate = updateInventoryDto.expirationDate
        ? new Date(updateInventoryDto.expirationDate)
        : undefined;
    }

    if (updateInventoryDto.purchaseDate !== undefined) {
      item.purchaseDate = updateInventoryDto.purchaseDate
        ? new Date(updateInventoryDto.purchaseDate)
        : undefined;
    }

    if (updateInventoryDto.notes !== undefined) {
      item.notes = updateInventoryDto.notes;
    }

    await this.em.flush();
    return item;
  }

  async remove(id: number) {
    const item = await this.findOne(id);
    await this.em.removeAndFlush(item);
  }
}
