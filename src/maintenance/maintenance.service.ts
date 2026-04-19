import { Injectable } from '@nestjs/common';
import { MaintenanceMode, MaintenanceState } from './maintenance-state';

@Injectable()
export class MaintenanceService {
  private state: MaintenanceState = {
    mode: MaintenanceMode.NORMAL,
    updatedAt: new Date().toISOString(),
  };

  getStatus(): MaintenanceState {
    return { ...this.state };
  }

  setStatus(
    mode: MaintenanceMode,
    reason?: string,
    scheduledStartTime?: string,
  ): MaintenanceState {
    this.state = {
      mode,
      reason,
      scheduledStartTime,
      updatedAt: new Date().toISOString(),
    };
    return { ...this.state };
  }
}
