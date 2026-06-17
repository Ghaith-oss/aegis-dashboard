import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { AppService } from './app.service';
import { RealtimeModule } from './realtime/realtime.module';
import { WeatherModule } from './weather/weather.module';

@Module({
  imports: [ScheduleModule.forRoot(), RealtimeModule, WeatherModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
