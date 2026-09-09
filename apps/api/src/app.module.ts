import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { AppService } from './app.service';
import { RealtimeModule } from './realtime/realtime.module';
import { WeatherModule } from './weather/weather.module';
import { PrismaModule } from './prisma/prisma.module';
import { AlertsModule } from './alerts/alerts.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    ScheduleModule.forRoot(),
    RealtimeModule,
    WeatherModule,
    PrismaModule,
    AlertsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
