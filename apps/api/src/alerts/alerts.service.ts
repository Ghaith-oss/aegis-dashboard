import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(
    @InjectQueue('alerts-queue') private alertsQueue: Queue,
    private prisma: PrismaService,
  ) {}

  // 1. New Read Method for the Dashboard
  async getRecentAlerts() {
    return this.prisma.alert.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
    });
  }

  // 2. Existing Write Method for Hardware Devices
  async createAlert(payload: any) {
    const { sensor, status } = payload;
    let severity = 'INFO';
    if (status === 'OPEN') severity = 'WARNING';
    if (status === 'CRITICAL') severity = 'CRITICAL';
    
    const message = `${sensor} reported status: ${status}`;
    
    const job = await this.alertsQueue.add('process-alert', {
      message,
      severity,
      eventType: 'DEVICE_TRIGGERED'
    });

    return { status: 'queued', jobId: job.id, message, severity };
  }

  // 3. Existing Write Method for System Events
  async createSystemAlert(message: string, severity: 'WARNING' | 'CRITICAL') {
    const job = await this.alertsQueue.add('process-alert', {
      message,
      severity,
      eventType: 'NEW_ALERT'
    });
    
    return { status: 'queued', jobId: job.id, message, severity };
  }
}