import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { InventoryItem } from '../entities/inventory.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class InventoryTasksService {
  constructor(private readonly em: EntityManager) {}
  private readonly logger = new Logger(InventoryTasksService.name);

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleExpiredItems(): Promise<void> {
    const now = new Date();
    const expiredItems = await this.em.find(
      InventoryItem,
      {
        expirationDate: { $lt: now },
      },
      {
        populate: ['ingredient'],
      },
    );

    if (expiredItems.length === 0) {
      this.logger.log('No expired items found');
      return;
    }
    for (const item of expiredItems) {
      if (!item.expirationDate) {
        continue;
      }

      this.logger.warn(
        'Expired item' +
          ':' +
          item.id +
          ' - ' +
          item.ingredient.name +
          ' on ' +
          item.expirationDate.toISOString(),
      );
    }
    this.logger.log(`Found ${expiredItems.length} expired items`);
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleLowStockItems(): Promise<void> {
    const lowQuantity = 2;
    const lowStockItems = await this.em.find(
      InventoryItem,
      {
        quantity: { $lte: lowQuantity },
      },
      {
        populate: ['ingredient', 'location'],
      },
    );
    for (const item of lowStockItems) {
      this.logger.warn(
        ' Low Stock Item' +
          ':' +
          item.id +
          ' - ' +
          item.ingredient.name +
          ' on ' +
          item.quantity,
      );
    }
    this.logger.log(`Found ${lowStockItems.length} low stock items`);
  }
}
