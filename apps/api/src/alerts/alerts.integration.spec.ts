import { Test, TestingModule } from '@nestjs/testing';
import { AlertsService } from './alerts.service';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeService } from '../realtime/realtime.service';
import { execSync } from 'child_process';

describe('AlertsService (Integration)', () => {
  let alertsService: AlertsService;
  let prismaService: PrismaService;
  let realtimeService: RealtimeService;

  beforeAll(async () => {
    // 1. Point to a temporary database so we do not overwrite your real dashboard data
    process.env.DATABASE_URL = 'file:./integration-test.db';

    // 2. Automatically generate the tables in the temporary database
    execSync('npx prisma db push --skip-generate', { 
      env: { ...process.env, DATABASE_URL: 'file:./integration-test.db' } 
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertsService,
        PrismaService,
        // 3. We use a "Spy" to intercept the realtime broadcast without booting WebSockets
        {
          provide: RealtimeService,
          useValue: { emit: jest.fn() },
        },
      ],
    }).compile();

    alertsService = module.get<AlertsService>(AlertsService);
    prismaService = module.get<PrismaService>(PrismaService);
    realtimeService = module.get<RealtimeService>(RealtimeService);
  });

  beforeEach(async () => {
    // Wipe the test database clean before every single test
    await prismaService.alert.deleteMany();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await prismaService.$disconnect();
  });

  it('Integration 1: Prisma DB Write Verification', async () => {
    // Execute the service logic
    await alertsService.createAlert({ sensor: 'Back Door', status: 'OPEN' });

    // Query the database directly to verify the service actually wrote to the disk
    const savedAlerts = await prismaService.alert.findMany();

    expect(savedAlerts.length).toBe(1);
    expect(savedAlerts[0].message).toBe('Back Door reported status: OPEN');
    expect(savedAlerts[0].severity).toBe('WARNING');
    expect(savedAlerts[0].acknowledged).toBe(false);
  });

  it('Integration 2: Service-to-Service Broadcasting', async () => {
    // Execute the service logic with a critical payload
    const result = await alertsService.createAlert({ sensor: 'Fire Alarm', status: 'CRITICAL' });

    // Verify the AlertsService successfully handed the data over to the RealtimeService
    expect(realtimeService.emit).toHaveBeenCalledTimes(1);
    expect(realtimeService.emit).toHaveBeenCalledWith(
      'DEVICE_TRIGGERED', 
      expect.objectContaining({
        id: result.id,
        message: 'Fire Alarm reported status: CRITICAL',
        severity: 'CRITICAL'
      })
    );
  });
});