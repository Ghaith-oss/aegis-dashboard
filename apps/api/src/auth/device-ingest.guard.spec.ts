import { DeviceIngestGuard } from './device-ingest.guard';
import { ConfigService } from '@nestjs/config';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

describe('DeviceIngestGuard (OWASP A01/A07)', () => {
  let guard: DeviceIngestGuard;
  let mockConfigService: Partial<ConfigService>;

  beforeEach(() => {
    // 1. We mock the environment so the "correct" token is known
    mockConfigService = {
      get: jest.fn().mockReturnValue('valid-test-token'),
    };
    guard = new DeviceIngestGuard(mockConfigService as ConfigService);
  });

  const createMockContext = (authHeader: string | undefined): ExecutionContext => {
    const mockRequest = {
      headers: { authorization: authHeader },
      ip: '127.0.0.1',
    } as unknown as Request;

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;
  };

  it('should throw UnauthorizedException if token is missing', () => {
    const context = createMockContext(undefined);
    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if token is invalid', () => {
    const context = createMockContext('hacker-guessed-token');
    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should allow access if token matches the environment secret', () => {
    const context = createMockContext('valid-test-token');
    expect(guard.canActivate(context)).toBe(true);
  });
});