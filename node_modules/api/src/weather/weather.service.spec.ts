import { Test, TestingModule } from '@nestjs/testing';
import { WeatherService } from './weather.service';
import { AlertsService } from '../alerts/alerts.service';

describe('WeatherService', () => {
  let service: WeatherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        {
          provide: AlertsService, 
          useValue: { createAlert: jest.fn() }, 
        },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});