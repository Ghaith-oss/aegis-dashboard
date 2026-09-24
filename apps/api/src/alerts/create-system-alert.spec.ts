import { Test, TestingModule } from '@nestjs/testing';
import { AlertsService } from './alerts.service';
import { getQueueToken } from '@nestjs/bullmq';

describe('Function: createSystemAlert (AlertsService)', () => {
  let service: AlertsService;

  const mockQueue = {
    add: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertsService,
        { provide: getQueueToken('alerts-queue'), useValue: mockQueue },
      ],
    }).compile();

    service = module.get<AlertsService>(AlertsService);
    jest.clearAllMocks();
  });

  const systemAlertData = [
    { message: 'Weather warning: High winds', severity: 'WARNING' },
    { message: 'System Error: Disk full', severity: 'CRITICAL' },
  ];

  it.each(systemAlertData)(
    'should push system alert to queue with message "%s" and severity "%s"',
    async ({ message, severity }) => {
      mockQueue.add.mockResolvedValueOnce({ id: 'job-456' });

      const result = await service.createSystemAlert(
        message,
        severity as 'WARNING' | 'CRITICAL',
      );

      expect(mockQueue.add).toHaveBeenCalledWith('process-alert', {
        message,
        severity,
        eventType: 'NEW_ALERT',
      });

      expect(result).toEqual({
        status: 'queued',
        jobId: 'job-456',
        message,
        severity,
      });
    },
  );
});
