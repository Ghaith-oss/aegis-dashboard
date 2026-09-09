import { Controller, Sse, Post, Body, UseGuards } from '@nestjs/common';
import { RealtimeService } from './realtime.service';
import { SimulateEventDto } from './dto/simulate-event.dto'; // <-- Import the DTO
import { DeviceIngestGuard } from '../auth/device-ingest.guard';

@Controller('api/realtime')
export class RealtimeController {
  constructor(private readonly realtimeService: RealtimeService) {}

  @Sse('stream')
  streamEvents() {
    return this.realtimeService.getEventStream();
  }

  @Post('simulate')
  @UseGuards(DeviceIngestGuard) // <-- This single line activates the security perimeter
  simulateEvent(@Body() payload: SimulateEventDto) {
    // If the code reaches here, the token is 100% valid and the payload matches the DTO
    this.realtimeService.emit('DEVICE_TRIGGERED', payload);
    return { status: 'success', message: 'Event ingested safely' };
  }
}
