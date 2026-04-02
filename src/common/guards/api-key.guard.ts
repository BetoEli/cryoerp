import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'crypto';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const providedKey = request.headers['x-api-key'];
    const apiKeysValue = this.configService.get<string>('API_KEYS') ?? '';
    const validKeys = apiKeysValue
      .split(',')
      .map((key) => key.trim())
      .filter(Boolean);

    if (!providedKey || validKeys.length === 0) {
      throw new UnauthorizedException('Missing or invalid API key');
    }

    const providedKeys = Array.isArray(providedKey)
      ? providedKey
      : [providedKey];

    const providedKeyBuffer = Buffer.from(providedKeys[0], 'utf8');

    for (const validKey of validKeys) {
      const validKeyBuffer = Buffer.from(validKey, 'utf8');

      if (providedKeyBuffer.length !== validKeyBuffer.length) {
        continue;
      }

      if (timingSafeEqual(providedKeyBuffer, validKeyBuffer)) {
        return true;
      }
    }

    throw new UnauthorizedException('Missing or invalid API key');
  }
}
