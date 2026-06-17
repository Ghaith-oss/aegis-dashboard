import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// This defines the shape of the data we send to the frontend
export interface SseEvent {
  type: string;
  data: any;
}

@Injectable()
export class RealtimeService {
  // The 'loudspeaker' that holds the stream of events
  private eventsSubject = new Subject<SseEvent>();

  // Other modules call this to broadcast an update (e.g., when a sensor fires)
  emit(eventName: string, payload: any) {
    this.eventsSubject.next({ type: eventName, data: payload });
  }

  // The controller uses this to connect a client's browser to the stream
  getStream(): Observable<MessageEvent> {
    return this.eventsSubject.asObservable().pipe(
      map((event) => ({
        data: event.data,
        type: event.type,
      } as MessageEvent)),
    );
  }
}