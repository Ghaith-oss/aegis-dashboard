import { Controller, Post, Body, UseGuards, Sse } from '@nestjs/common';
import { SimulateEventDto } from './dto/simulate-event.dto';
import { DeviceIngestGuard } from '../auth/device-ingest.guard';
import { AlertsService } from '../alerts/alerts.service';
import { RealtimeService } from './realtime.service';

@Controller('api/realtime')
export class RealtimeController {
  constructor(
    private readonly alertsService: AlertsService,
    private readonly realtimeService: RealtimeService
  ) {}

  @Sse('stream')
  streamEvents() {
    return this.realtimeService.getEventStream();
  }

  @Post('simulate')
  @UseGuards(DeviceIngestGuard)
  simulateEvent(@Body() payload: SimulateEventDto) {
    // We now route it through the central hub to persist to SQLite AND broadcast
    this.alertsService.createAlert(payload);
    return { status: 'success', message: 'Event persisted and broadcasted' };
  }
}