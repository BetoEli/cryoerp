import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { MaintenanceService } from '../maintenance.service';
import { MaintenanceMode, MaintenanceState } from '../maintenance-state';

interface MaintenanceServiceLike {
  getStatus(): MaintenanceState;
}

@Injectable()
export class MaintenanceInterceptor implements NestInterceptor {
  private readonly maintenanceService: MaintenanceServiceLike;

  constructor(maintenanceService: MaintenanceService) {
    this.maintenanceService = maintenanceService as MaintenanceServiceLike;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const status: MaintenanceState = this.maintenanceService.getStatus();

    if (status.mode !== MaintenanceMode.MAINTENANCE) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const method: string = request.method;
    const url: string = request.url;

    const isAllowed =
      url.startsWith('/api/maintenance') ||
      (method === 'GET' && url.startsWith('/api/health'));

    if (isAllowed) {
      return next.handle();
    }

    throw new ServiceUnavailableException({
      statusCode: 503,
      message: status.reason ?? 'System is under maintenance',
      mode: status.mode,
      scheduledStartTime: status.scheduledStartTime,
    });
  }
}
