import { Module } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceController } from './maintenance.controller';
import { MaintenanceApiKeyGuard } from './guards/maintenance-api-key.guard';

@Module({
  providers: [MaintenanceService, MaintenanceApiKeyGuard],
  controllers: [MaintenanceController],
  exports: [MaintenanceService],
})
export class MaintenanceModule {}
