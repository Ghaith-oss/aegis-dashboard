import { Test, TestingModule } from '@nestjs/testing';
import { AlertsProcessor, AlertJobData } from './alerts.processor';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeService } from '../realtime/realtime.service';
import { execSync } from 'child_process';
import { Job } from 'bullmq';
import { Alert } from '@prisma/client';

describe('AlertsProcessor (Integration)', () => {
  let processor: AlertsProcessor;
  let prismaService: PrismaService;

  const mockRealtimeService = { emit: jest.fn() };

  beforeAll(async () => {
    process.env.DATABASE_URL = 'file:./integration-test.db';

    execSync('npx prisma db push --skip-generate', {
      env: { ...process.env, DATABASE_URL: 'file:./integration-test.db' },
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertsProcessor,
        PrismaService,
        {
          provide: RealtimeService,
          useValue: mockRealtimeService,
        },
      ],
    }).compile();

    processor = module.get<AlertsProcessor>(AlertsProcessor);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    await prismaService.alert.deleteMany();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await prismaService.$disconnect();
  });

  it('Integration 1: Processor successfully writes to Prisma DB', async () => {
    const mockJob = {
      id: 'int-job-1',
      data: {
        message: 'Back Door reported status: OPEN',
        severity: 'WARNING' as const,
        eventType: 'DEVICE_TRIGGERED',
      },
    } as unknown as Job<AlertJobData, Alert, string>;

    await processor.process(mockJob);

    const savedAlerts = await prismaService.alert.findMany();

    expect(savedAlerts.length).toBe(1);
    expect(savedAlerts[0].message).toBe('Back Door reported status: OPEN');
    expect(savedAlerts[0].severity).toBe('WARNING');
    expect(savedAlerts[0].acknowledged).toBe(false);
  });

  it('Integration 2: Processor broadcasts to RealtimeService', async () => {
    const mockJob = {
      id: 'int-job-2',
      data: {
        message: 'Fire Alarm reported status: CRITICAL',
        severity: 'CRITICAL' as const,
        eventType: 'DEVICE_TRIGGERED',
      },
    } as unknown as Job<AlertJobData, Alert, string>;

    const result = await processor.process(mockJob);

    expect(mockRealtimeService.emit).toHaveBeenCalledTimes(1);
    expect(mockRealtimeService.emit).toHaveBeenCalledWith(
      'DEVICE_TRIGGERED',
      expect.objectContaining({
        id: result.id,
        message: 'Fire Alarm reported status: CRITICAL',
        severity: 'CRITICAL',
      }),
    );
  });
});
