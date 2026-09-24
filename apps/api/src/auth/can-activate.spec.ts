import { DeviceIngestGuard } from './device-ingest.guard';
import { ConfigService } from '@nestjs/config';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

describe('Function: canActivate (DeviceIngestGuard)', () => {
  let guard: DeviceIngestGuard;
  let mockConfigService: Partial<ConfigService>;

  beforeEach(() => {
    mockConfigService = {
      get: jest.fn().mockReturnValue('valid-test-token'),
    };
    guard = new DeviceIngestGuard(mockConfigService as ConfigService);
  });

  const createMockContext = (
    authHeader: string | null | undefined,
  ): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: authHeader },
          ip: '127.0.0.1',
        }),
      }),
    } as ExecutionContext;
  };

  const badTokens = [
    undefined,
    null,
    '',
    ' ',
    'Bearer ',
    'Bearer null',
    'wrong-token',
    'valid-test-token-extra',
    '123456789',
    '<script>alert(1)</script>',
  ];

  it.each(badTokens)(
    'should throw UnauthorizedException when token is "%s"',
    (token) => {
      const context = createMockContext(token);
      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    },
  );

  it('should return true for the exact valid token', () => {
    const context = createMockContext('valid-test-token');
    expect(guard.canActivate(context)).toBe(true);
  });
});
