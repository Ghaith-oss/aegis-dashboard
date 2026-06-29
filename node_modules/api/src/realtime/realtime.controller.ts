import { Controller, Sse, Post, Body } from '@nestjs/common';
import { RealtimeService } from './realtime.service';
import { SimulateEventDto } from './dto/simulate-event.dto'; // <-- Import the DTO

@Controller('api/realtime')
export class RealtimeController {
  constructor(private readonly realtimeService: RealtimeService) {}

  @Sse('stream')
  streamEvents() {
    return this.realtimeService.getEventStream();
  }

  @Post('simulate')
  simulateEvent(@Body() payload: SimulateEventDto) { // <-- Apply it to the Body
    // Because of the Global Pipe, if the code reaches this line,
    // we are 100% guaranteed that 'payload' is perfectly safe and formatted.
    this.realtimeService.emit('DEVICE_TRIGGERED', payload);
    return { success: true, message: 'Event broadcasted' };
  }
}