import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express'; // <-- 1. We import the Express Request type

@Injectable()
export class DeviceIngestGuard implements CanActivate {
  private readonly logger = new Logger(DeviceIngestGuard.name);

  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    // 2. We pass <Request> so TypeScript knows exactly what properties are available
    const request = context.switchToHttp().getRequest<Request>();
    
    // 3. ESLint is now happy because it knows .headers and .ip legally exist on a Request
    const authHeader = request.headers.authorization;
    const validToken = this.configService.get<string>('DEVICE_INGEST_TOKEN');

    if (!authHeader || authHeader !== validToken) {
      this.logger.warn(`Unauthorized simulated event attempt from IP: ${request.ip}`);
      throw new UnauthorizedException('Invalid or missing device ingest token');
    }

    return true;
  }
}