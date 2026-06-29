import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';

// This defines the exact structure NestJS needs to broadcast Named Events
export interface SseMessage {
  data: any;
  type: string;
}

@Injectable()
export class RealtimeService {
  // This RxJS Subject acts as our central event bus
  private eventSubject = new Subject<SseMessage>();

  // 1. The Controller uses this to open the stream for the frontend
  getEventStream(): Observable<SseMessage> {
    return this.eventSubject.asObservable();
  }

  // 2. The rest of the app uses this to push new data into the stream
  emit(type: string, data: any) {
    this.eventSubject.next({ type, data });
  }
}