import { Module } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [RealtimeModule],
  providers: [AlertsService],
  controllers: [AlertsController],
  exports: [AlertsService]
})
export class AlertsModule {}
