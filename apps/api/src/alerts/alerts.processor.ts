import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeService } from '../realtime/realtime.service';

@Processor('alerts-queue')
export class AlertsProcessor extends WorkerHost {
  private readonly logger = new Logger(AlertsProcessor.name);

  constructor(
    private prisma: PrismaService,
    private realtime: RealtimeService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const startTime = Date.now();
    const { message, severity, eventType } = job.data;

    // 1. Safely write to SQLite in the background
    const alert = await this.prisma.alert.create({
      data: { message, severity, acknowledged: false },
    });

    // 2. Broadcast to the Vue frontend
    this.realtime.emit(eventType, alert);

    // 3. Log the performance metric
    const executionTime = Date.now() - startTime;
    this.logger.log(`Job ${job.id} processed in ${executionTime}ms. Payload: ${message}`);
    
    return alert;
  }
}