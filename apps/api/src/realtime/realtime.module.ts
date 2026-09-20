import { Module, forwardRef } from '@nestjs/common';
import { RealtimeService } from './realtime.service';
import { RealtimeController } from './realtime.controller';
import { AlertsModule } from '../alerts/alerts.module';
@Module({
  imports: [forwardRef(() => AlertsModule)],
  providers: [RealtimeService],
  controllers: [RealtimeController],
  exports: [RealtimeService],
})
export class RealtimeModule {}
