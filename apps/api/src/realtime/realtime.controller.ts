import { Controller, Post, Body, UseGuards, Sse } from '@nestjs/common';
import { SimulateEventDto } from './dto/simulate-event.dto';
import { DeviceIngestGuard } from '../auth/device-ingest.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AlertsService } from '../alerts/alerts.service';
import { RealtimeService } from './realtime.service';

@Controller('api/realtime')
export class RealtimeController {
  constructor(
    private readonly alertsService: AlertsService,
    private readonly realtimeService: RealtimeService,
  ) {}

  @UseGuards(JwtAuthGuard) // Locks the human dashboard stream
  @Sse('stream')
  streamEvents() {
    return this.realtimeService.getEventStream();
  }

  @Post('simulate')
  @UseGuards(DeviceIngestGuard) // Keeps the machine-to-machine ingest secure
  async simulateEvent(@Body() payload: SimulateEventDto) {
    await this.alertsService.createAlert(payload);
    return { status: 'success', message: 'Event persisted and broadcasted' };
  }
}