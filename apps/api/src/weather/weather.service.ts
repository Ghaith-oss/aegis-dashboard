import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { RealtimeService } from '../realtime/realtime.service';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private lastWindSpeed = -1;

  constructor(private readonly realtimeService: RealtimeService) {}

  // Runs every 10 seconds for the sake of the dashboard demo
  @Cron('*/10 * * * * *')
  async fetchWeather() {
    try {
      // Using live coordinates
      const response = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=51.4416&longitude=5.4697&current_weather=true'
      );
      const data = await response.json();
      const weather = data.current_weather;

      if (weather && weather.windspeed !== this.lastWindSpeed) {
        this.lastWindSpeed = weather.windspeed;
        this.logger.log(`External trigger detected: Windspeed changed to ${weather.windspeed} km/h`);
        
        // Push the event into the SSE stream automatically
        this.realtimeService.emit('WEATHER_UPDATE', {
          source: 'Open-Meteo',
          condition: 'WIND',
          value: weather.windspeed,
          unit: 'km/h',
        });
      }
    } catch (error) {
      this.logger.error('Failed to fetch weather data', error.message);
    }
  }
}