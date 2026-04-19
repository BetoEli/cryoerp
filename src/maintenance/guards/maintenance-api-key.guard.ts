import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'crypto';
import { Request } from 'express';

@Injectable()
export class MaintenanceApiKeyGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-api-key'];
    const expectedKey = this.configService.getOrThrow<string>(
      'MAINTENANCE_API_KEY',
    );

    let isValidKey = false;
    if (apiKey) {
      try {
        isValidKey = timingSafeEqual(
          Buffer.from(apiKey as string),
          Buffer.from(expectedKey),
        );
      } catch {
        isValidKey = false;
      }
    }

    if (!isValidKey) {
      throw new UnauthorizedException('Invalid maintenance API key');
    }
    return true;
  }
}
