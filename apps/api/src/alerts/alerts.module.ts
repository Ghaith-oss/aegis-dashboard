import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AlertsService } from './alerts.service';
import { AlertsProcessor } from './alerts.processor';
import { AlertsController } from './alerts.controller';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [
    forwardRef(() => RealtimeModule),
    BullModule.registerQueue({
      name: 'alerts-queue',
    }),
  ],
  providers: [AlertsService, AlertsProcessor],
  controllers: [AlertsController],
  exports: [AlertsService],
})
export class AlertsModule {}