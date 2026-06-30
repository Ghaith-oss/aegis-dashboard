import { useEffect, useState } from 'react';

export interface DashboardEvent {
  type: string;
  data: any;
  timestamp: Date;
}

export function useRealtime() {
  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource('/api/realtime/stream');

    eventSource.onopen = () => {
      console.log('SSE Connection established');
      setIsConnected(true);
    };

    // A helper to format our named events into the UI state
    const processEvent = (eventName: string, event: MessageEvent) => {
      const parsedData = JSON.parse(event.data);
      setEvents((prev) => [
        {
          type: eventName,
          data: parsedData,
          timestamp: new Date(),
        },
        ...prev,
      ].slice(0, 50));
    };

    // Explicitly listen for the named triggers our backend is sending
    eventSource.addEventListener('NEW_ALERT', (e) => processEvent('NEW_ALERT', e));
    eventSource.addEventListener('WEATHER_UPDATE', (e) => processEvent('WEATHER_UPDATE', e));
    eventSource.addEventListener('DEVICE_TRIGGERED', (e) => processEvent('DEVICE_TRIGGERED', e));

    eventSource.onerror = (error) => {
      console.error('SSE Connection lost, attempting to reconnect...', error);
      setIsConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return { events, isConnected };
}