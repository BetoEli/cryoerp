import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { FilterQuery, FindOptions, raw } from '@mikro-orm/core';
import { CreateInventoryItemDto } from './dto/create-inventory.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory.dto';
import { Ingredient } from '../ingredients/entities/ingredient.entity';
import { Location } from '../locations/entities/location.entity';
import { InventoryItem } from './entities/inventory.entity';

export interface LocationSummary {
  locationId: number;
  locationName: string;
  itemCount: number;
  totalQuantity: number;
  expiredCount: number;
}

@Injectable()
export class InventoryService {
  constructor(private readonly em: EntityManager) {}

  async create(createInventoryDto: CreateInventoryItemDto, userId: number) {
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
      user: userId,
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

    await this.em.persist(inventoryItem).flush();
    return inventoryItem;
  }

  async findAll(userId: number) {
    return this.em.find(
      InventoryItem,
      { location: { user: userId } },
      { populate: ['ingredient', 'location'] },
    );
  }

  async findSummary(userId: number): Promise<LocationSummary[]> {
    const results: LocationSummary[] = await this.em
      .createQueryBuilder(InventoryItem, 'i')
      .select([
        raw('l.id as "locationId"'),
        raw('l.name as "locationName"'),
        raw('count(i.id) as "itemCount"'),
        raw('sum(i.quantity) as "totalQuantity"'),
        raw(
          'sum(case when i.expiration_date is not null and i.expiration_date < now() then 1 else 0 end) as "expiredCount"',
        ),
      ])
      .leftJoin('i.location', 'l')
      .where({ location: { user: userId } })
      .groupBy(['l.id', 'l.name'])
      .orderBy({ 'l.name': 'asc' })
      .execute();

    return results;
  }

  async findExpiring(days = 7, userId: number) {
    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() + days);

    const where: FilterQuery<InventoryItem> = {
      expirationDate: {
        $gte: now,
        $lte: cutoff,
      },
      location: { user: userId },
    };

    const options: FindOptions<InventoryItem, 'ingredient' | 'location'> = {
      populate: ['ingredient', 'location'],
      orderBy: {
        expirationDate: 'asc',
      },
    };

    return this.em.find(InventoryItem, where, options);
  }

  async findOne(id: number, userId: number) {
    const item = await this.em.findOne(
      InventoryItem,
      { id, location: { user: userId } },
      { populate: ['ingredient', 'location'] },
    );
    if (!item) {
      throw new NotFoundException(`Inventory item with id ${id} not found`);
    }

    return item;
  }

  async update(
    id: number,
    updateInventoryDto: UpdateInventoryItemDto,
    userId: number,
  ) {
    const item = await this.findOne(id, userId);

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
        user: userId,
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

  async remove(id: number, userId: number) {
    const item = await this.findOne(id, userId);
    await this.em.remove(item).flush();
  }
}
