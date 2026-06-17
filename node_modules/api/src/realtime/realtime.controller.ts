import { Controller, Sse, Post, Body } from '@nestjs/common';
import { Observable } from 'rxjs';
import { RealtimeService } from './realtime.service';

@Controller('realtime')
export class RealtimeController {
  constructor(private readonly realtimeService: RealtimeService) {}

  // 1. The stream endpoint: Clients connect here and stay connected
  @Sse('stream')
  streamEvents(): Observable<MessageEvent> {
    return this.realtimeService.getStream();
  }

  // 2. A trigger endpoint: We hit this to inject a fake event into the stream
  @Post('simulate')
  simulateEvent(@Body() payload: any) {
    this.realtimeService.emit('DEVICE_TRIGGERED', payload);
    return { success: true, message: 'Event broadcasted to all connected clients' };
  }
}