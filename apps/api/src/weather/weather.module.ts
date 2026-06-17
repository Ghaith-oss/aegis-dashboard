import { Module } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [RealtimeModule],
  providers: [WeatherService]
})
export class WeatherModule {}
