import { Test, TestingModule } from '@nestjs/testing';
import { AlertsService } from './alerts.service';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeService } from '../realtime/realtime.service';

describe('Function: createAlert (AlertsService)', () => {
  let service: AlertsService;
  let prisma: PrismaService;
  let realtime: RealtimeService;

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
    prisma = module.get<PrismaService>(PrismaService);
    realtime = module.get<RealtimeService>(RealtimeService);

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

    expect(prisma.alert.create).toHaveBeenCalledWith({
      data: { message: expectedMessage, severity: expectedSeverity, acknowledged: false },
    });
    expect(realtime.emit).toHaveBeenCalledWith('DEVICE_TRIGGERED', result);
    expect(result.id).toBe('manual-test-id');
  });
});