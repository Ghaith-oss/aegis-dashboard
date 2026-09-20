import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeService } from '../realtime/realtime.service';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    private prisma: PrismaService,
    // We add forwardRef here to resolve the circular dependency with RealtimeModule
    @Inject(forwardRef(() => RealtimeService))
    private realtime: RealtimeService,
  ) {}

  // FEATURE A: Used by the WeatherService
  async createSystemAlert(message: string, severity: 'WARNING' | 'CRITICAL') {
    const alert = await this.prisma.alert.create({
      data: {
        message,
        severity,
        acknowledged: false,
      },
    });

    this.logger.log(`System Alert saved to DB: ${message}`);
    this.realtime.emit('NEW_ALERT', alert);

    return alert; // (Removed the accidental duplicate create call here)
  }

  // FEATURE B: Used by the RealtimeController (/simulate endpoint)
  async createAlert(payload: { sensor: string; status: string }) {
    const alert = await this.prisma.alert.create({
      data: {
        message: `${payload.sensor} reported status: ${payload.status}`,
        severity: payload.status === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
        acknowledged: false,
      },
    });

    this.logger.log(`Manual Alert saved to DB: ${alert.message}`);
    this.realtime.emit('DEVICE_TRIGGERED', alert);

    return alert;
  }
}