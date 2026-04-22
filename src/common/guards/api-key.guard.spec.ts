import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ApiKeyGuard } from './api-key.guard';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

describe('ApiKeyGuard', () => {
  let guard: ApiKeyGuard;
  let configService: { getOrThrow: jest.Mock };
  let reflector: { getAllAndOverride: jest.Mock };

  const createContext = (headers: Record<string, string> = {}): ExecutionContext =>
    ({
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ headers }),
      }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    configService = { getOrThrow: jest.fn().mockReturnValue('secret-key') };
    reflector = { getAllAndOverride: jest.fn().mockReturnValue(false) };
    guard = new ApiKeyGuard(
      configService as unknown as ConfigService,
      reflector as unknown as Reflector,
    );
  });

  it('should return true for routes marked @Public()', () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    const ctx = createContext();
    expect(guard.canActivate(ctx)).toBe(true);
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(
      IS_PUBLIC_KEY,
      expect.any(Array),
    );
  });

  it('should return true when a valid API key is provided', () => {
    const ctx = createContext({ 'x-api-key': 'secret-key' });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('should throw UnauthorizedException when no API key header is present', () => {
    const ctx = createContext();
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when an invalid API key is provided', () => {
    const ctx = createContext({ 'x-api-key': 'wrong-key' });
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('should return true when the second key in the comma-separated list matches', () => {
    configService.getOrThrow.mockReturnValue('first-key, secret-key');
    const ctx = createContext({ 'x-api-key': 'secret-key' });
    expect(guard.canActivate(ctx)).toBe(true);
  });
});
