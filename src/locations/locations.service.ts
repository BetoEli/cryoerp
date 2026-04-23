import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { LocationQueryDto } from './dto/location-query.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { EntityManager, FilterQuery } from '@mikro-orm/postgresql';
import { Location } from './entities/location.entity';
import { InventoryItem } from '../inventory/entities/inventory.entity';

@Injectable()
export class LocationsService {
  date = new Date();
  constructor(private readonly em: EntityManager) {}

  async create(createLocationDto: CreateLocationDto, userId: number) {
    const location = this.em.create(Location, {
      ...createLocationDto,
      user: userId,
      createdAt: this.date,
      updatedAt: this.date,
    });
    await this.em.persist(location).flush();
    return location;
  }

  async findAll(query?: LocationQueryDto, userId?: number) {
    const filter: FilterQuery<Location> = {};
    if (query?.type) filter.type = query.type;
    if (userId !== undefined) filter.user = userId;
    return this.em.find(Location, filter);
  }

  async findOne(id: number, userId: number) {
    try {
      return await this.em.findOneOrFail(
        Location,
        { id, user: userId },
        {
          populate: ['inventoryItems', 'inventoryItems.ingredient'],
        },
      );
    } catch {
      throw new NotFoundException(`Location with id ${id} not found`);
    }
  }

  async update(
    id: number,
    updateLocationDto: UpdateLocationDto,
    userId: number,
  ) {
    const location = await this.findOne(id, userId);
    Object.assign(location, updateLocationDto);
    await this.em.flush();
    return location;
  }

  async remove(id: number, userId: number) {
    const location = await this.findOne(id, userId);

    const inventoryCount = await this.em.count(InventoryItem, {
      location: { id },
    });
    if (inventoryCount > 0) {
      throw new ConflictException(
        'Cannot delete location: inventory items still reference it',
      );
    }

    await this.em.remove(location).flush();
  }
}
