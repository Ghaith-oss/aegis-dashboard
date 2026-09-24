import { Test, TestingModule } from '@nestjs/testing';
import { AlertsProcessor } from './alerts.processor';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeService } from '../realtime/realtime.service';

describe('AlertsProcessor Unit Tests', () => {
  let processor: AlertsProcessor;

  const mockPrismaService = {
    alert: { create: jest.fn() },
  };

  const mockRealtimeService = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertsProcessor,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: RealtimeService, useValue: mockRealtimeService },
      ],
    }).compile();

    processor = module.get<AlertsProcessor>(AlertsProcessor);
    jest.clearAllMocks();
  });

  it('should process the job, write to DB, and emit realtime event', async () => {
    const mockJob: any = {
      id: 'job-789',
      data: {
        message: 'Test message',
        severity: 'WARNING',
        eventType: 'DEVICE_TRIGGERED',
      }
    };

    const mockCreatedAlert = {
      id: 'alert-1',
      message: 'Test message',
      severity: 'WARNING',
      acknowledged: false,
    };

    mockPrismaService.alert.create.mockResolvedValueOnce(mockCreatedAlert);

    const result = await processor.process(mockJob);

    expect(mockPrismaService.alert.create).toHaveBeenCalledWith({
      data: { message: 'Test message', severity: 'WARNING', acknowledged: false }
    });
    expect(mockRealtimeService.emit).toHaveBeenCalledWith('DEVICE_TRIGGERED', mockCreatedAlert);
    expect(result).toEqual(mockCreatedAlert);
  });
});