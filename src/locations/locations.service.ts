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

  async create(createLocationDto: CreateLocationDto) {
    const location = this.em.create(Location, {
      ...createLocationDto,
      createdAt: this.date,
      updatedAt: this.date,
    });
    await this.em.persistAndFlush(location);
    return location;
  }

  async findAll(query?: LocationQueryDto) {
    const filter: FilterQuery<Location> = query?.type
      ? { type: query.type }
      : {};
    return this.em.find(Location, filter);
  }

  async findOne(id: number) {
    try {
      return await this.em.findOneOrFail(
        Location,
        { id },
        {
          populate: ['inventoryItems', 'inventoryItems.ingredient'],
        },
      );
    } catch {
      throw new NotFoundException(`Location with id ${id} not found`);
    }
  }

  async update(id: number, updateLocationDto: UpdateLocationDto) {
    const location = await this.findOne(id);
    Object.assign(location, updateLocationDto);
    await this.em.flush();
    return location;
  }

  async remove(id: number) {
    const location = await this.findOne(id);

    const inventoryCount = await this.em.count(InventoryItem, {
      location: { id },
    });
    if (inventoryCount > 0) {
      throw new ConflictException(
        'Cannot delete location: inventory items still reference it',
      );
    }

    await this.em.removeAndFlush(location);
  }
}
