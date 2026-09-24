import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);

  constructor(@InjectQueue('alerts-queue') private alertsQueue: Queue) {}

  // FEATURE A: Used by the WeatherService
  async createSystemAlert(message: string, severity: 'WARNING' | 'CRITICAL') {
    // Instantly offload the work to BullMQ
    const job = await this.alertsQueue.add('process-alert', {
      message,
      severity,
      eventType: 'NEW_ALERT',
    });

    this.logger.log(`System Alert queued (Job ID: ${job.id}): ${message}`);
    return { status: 'queued', jobId: job.id, message, severity };
  }

  // FEATURE B: Used by the RealtimeController (/simulate endpoint)
  async createAlert(payload: { sensor: string; status: string }) {
    const severity = payload.status === 'CRITICAL' ? 'CRITICAL' : 'WARNING';
    const message = `${payload.sensor} reported status: ${payload.status}`;

    // Instantly offload the work to BullMQ
    const job = await this.alertsQueue.add('process-alert', {
      message,
      severity,
      eventType: 'DEVICE_TRIGGERED',
    });

    this.logger.log(`Manual Alert queued (Job ID: ${job.id}): ${message}`);
    return { status: 'queued', jobId: job.id, message, severity };
  }
}
