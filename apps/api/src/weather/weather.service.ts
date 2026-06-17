import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AlertsService } from '../alerts/alerts.service'; // <-- Import

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private lastWindSpeed = -1;

  constructor(private readonly alertsService: AlertsService) {} // <-- Inject

  @Cron('*/10 * * * * *')
  async fetchWeather() {
    try {
      const response = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=51.4416&longitude=5.4697&current_weather=true'
      );
      const data = await response.json();
      const weather = data.current_weather;

      // Using the "always fire" logic from our test
      if (weather) {
        // This now saves to the database AND broadcasts to the browser!
        await this.alertsService.createSystemAlert(
          `Weather trigger: Wind speed changed to ${weather.windspeed} km/h`,
          'WARNING'
        );
      }
    } catch (error) {
      this.logger.error('Failed to fetch weather data', error.message);
    }
  }
}