import { Test, TestingModule } from '@nestjs/testing';
import { AlertsService } from './alerts.service';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeService } from '../realtime/realtime.service';
import { execSync } from 'child_process';

describe('AlertsService (Integration)', () => {
  let alertsService: AlertsService;
  let prismaService: PrismaService;

  // We declare the mock object outside so we can assert on it directly
  const mockRealtimeService = { emit: jest.fn() };

  beforeAll(async () => {
    process.env.DATABASE_URL = 'file:./integration-test.db';

    execSync('npx prisma db push --skip-generate', { 
      env: { ...process.env, DATABASE_URL: 'file:./integration-test.db' } 
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertsService,
        PrismaService,
        {
          provide: RealtimeService,
          useValue: mockRealtimeService, // Pass the constant here
        },
      ],
    }).compile();

    alertsService = module.get<AlertsService>(AlertsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    await prismaService.alert.deleteMany();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await prismaService.$disconnect();
  });

  it('Integration 1: Prisma DB Write Verification', async () => {
    await alertsService.createAlert({ sensor: 'Back Door', status: 'OPEN' });

    const savedAlerts = await prismaService.alert.findMany();

    expect(savedAlerts.length).toBe(1);
    expect(savedAlerts[0].message).toBe('Back Door reported status: OPEN');
    expect(savedAlerts[0].severity).toBe('WARNING');
    expect(savedAlerts[0].acknowledged).toBe(false);
  });

  it('Integration 2: Service-to-Service Broadcasting', async () => {
    const result = await alertsService.createAlert({ sensor: 'Fire Alarm', status: 'CRITICAL' });

    // Asserting on the plain mock object bypasses the unbound-method linting error
    expect(mockRealtimeService.emit).toHaveBeenCalledTimes(1);
    expect(mockRealtimeService.emit).toHaveBeenCalledWith(
      'DEVICE_TRIGGERED', 
      expect.objectContaining({
        id: result.id,
        message: 'Fire Alarm reported status: CRITICAL',
        severity: 'CRITICAL'
      })
    );
  });
});