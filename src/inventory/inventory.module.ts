import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { InventoryTasksService } from './inventory-tasks/inventory-tasks.service';

@Module({
  controllers: [InventoryController],
  providers: [InventoryService, InventoryTasksService],
})
export class InventoryModule {}
