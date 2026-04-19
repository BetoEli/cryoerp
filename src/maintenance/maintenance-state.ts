export enum MaintenanceMode {
  NORMAL = 'normal',
  SCHEDULED = 'scheduled',
  MAINTENANCE = 'maintenance',
}

export interface MaintenanceState {
  mode: MaintenanceMode;
  reason?: string;
  scheduledStartTime?: string;
  updatedAt: string;
}
