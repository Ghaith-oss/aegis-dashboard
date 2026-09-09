import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DeviceIngestGuard implements CanActivate {
  private readonly logger = new Logger(DeviceIngestGuard.name);

  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    const validToken = this.configService.get<string>('DEVICE_INGEST_TOKEN');

    if (!authHeader || authHeader !== validToken) {
      // OWASP A09: We log the exact IP and attempt for security auditing
      this.logger.warn(`Unauthorized simulated event attempt from IP: ${request.ip}`);
      
      // OWASP A01 & A07: We block the request immediately
      throw new UnauthorizedException('Invalid or missing device ingest token');
    }

    return true;
  }
}