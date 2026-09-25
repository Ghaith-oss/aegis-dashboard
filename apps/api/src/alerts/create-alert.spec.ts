import { Test, TestingModule } from '@nestjs/testing';
import { AlertsService } from './alerts.service';
import { getQueueToken } from '@nestjs/bullmq';
import { PrismaService } from '../prisma/prisma.service';

describe('Function: createAlert (AlertsService)', () => {
  let service: AlertsService;

  // Mock the BullMQ Queue instead of the database
  const mockQueue = {
    add: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertsService,
        { provide: getQueueToken('alerts-queue'), useValue: mockQueue },
        { provide: PrismaService, useValue: { findMany: jest.fn() } }
      ],
    }).compile();

    service = module.get<AlertsService>(AlertsService);
    jest.clearAllMocks();
  });

  const manualAlertData = [
    { sensor: 'Front Door', status: 'OPEN', expectedSeverity: 'WARNING' },
    { sensor: 'Back Window', status: 'CRITICAL', expectedSeverity: 'CRITICAL' },
  ];

  it.each(manualAlertData)(
    'should push manual alert to queue for "%s" status "%s"',
    async ({ sensor, status, expectedSeverity }) => {
      const expectedMessage = `${sensor} reported status: ${status}`;

      mockQueue.add.mockResolvedValueOnce({ id: 'job-123' });

      const result = await service.createAlert({ sensor, status });

      // Verify the service handed the work off to the queue
      expect(mockQueue.add).toHaveBeenCalledWith('process-alert', {
        message: expectedMessage,
        severity: expectedSeverity,
        eventType: 'DEVICE_TRIGGERED',
      });

      expect(result).toEqual({
        status: 'queued',
        jobId: 'job-123',
        message: expectedMessage,
        severity: expectedSeverity,
      });
    },
  );
});
