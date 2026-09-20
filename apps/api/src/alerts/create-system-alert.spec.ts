import { Test, TestingModule } from '@nestjs/testing';
import { AlertsService } from './alerts.service';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeService } from '../realtime/realtime.service';

describe('Function: createSystemAlert (AlertsService)', () => {
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

  const systemAlertData = [
    { message: 'Weather warning: High winds', severity: 'WARNING' },
    { message: 'System Error: Disk full', severity: 'CRITICAL' },
    { message: 'Temperature drop detected', severity: 'WARNING' },
  ];

  it.each(systemAlertData)('should create system alert with message "%s" and severity "%s"', async ({ message, severity }) => {
    mockPrismaService.alert.create.mockResolvedValueOnce({
      id: 'system-test-id',
      message,
      severity,
      acknowledged: false,
    });

    const result = await service.createSystemAlert(message, severity as 'WARNING' | 'CRITICAL');

    expect(prisma.alert.create).toHaveBeenCalledWith({
      data: { message, severity, acknowledged: false },
    });
    expect(realtime.emit).toHaveBeenCalledWith('NEW_ALERT', result);
    expect(result.id).toBe('system-test-id');
  });
});