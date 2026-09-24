import { Test, TestingModule } from '@nestjs/testing';
import { AlertsService } from './alerts.service';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeService } from '../realtime/realtime.service';

describe('Function: createAlert (AlertsService)', () => {
  let service: AlertsService;

  const mockPrismaService = {
    alert: { create: jest.fn() },
  };

  const mockRealtimeService = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: RealtimeService, useValue: mockRealtimeService },
      ],
    }).compile();

    service = module.get<AlertsService>(AlertsService);
    jest.clearAllMocks();
  });

  const manualAlertData = [
    { sensor: 'Front Door', status: 'OPEN', expectedSeverity: 'WARNING' },
    { sensor: 'Back Window', status: 'CRITICAL', expectedSeverity: 'CRITICAL' },
    { sensor: 'Motion Sensor', status: 'MOTION_DETECTED', expectedSeverity: 'WARNING' },
    { sensor: 'Garage Door', status: 'OFFLINE', expectedSeverity: 'WARNING' },
  ];

  it.each(manualAlertData)('should handle manual alert for "%s" status "%s"', async ({ sensor, status, expectedSeverity }) => {
    const expectedMessage = `${sensor} reported status: ${status}`;
    
    mockPrismaService.alert.create.mockResolvedValueOnce({
      id: 'manual-test-id',
      message: expectedMessage,
      severity: expectedSeverity,
      acknowledged: false,
    });

    const result = await service.createAlert({ sensor, status });

    // Assert on the mock objects directly
    expect(mockPrismaService.alert.create).toHaveBeenCalledWith({
      data: { message: expectedMessage, severity: expectedSeverity, acknowledged: false },
    });
    expect(mockRealtimeService.emit).toHaveBeenCalledWith('DEVICE_TRIGGERED', result);
    expect(result.id).toBe('manual-test-id');
  });
});