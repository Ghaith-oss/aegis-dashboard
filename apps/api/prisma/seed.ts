// apps/api/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const zone1 = await prisma.zone.create({
    data: {
      name: 'Main Entrance',
      isArmed: true,
      devices: {
        create: [
          { name: 'Front Porch Camera', type: 'CAMERA' },
          { name: 'Front Door Contact', type: 'DOOR_CONTACT' },
        ],
      },
    },
  });
  
  const hashedPassword = await bcrypt.hash('aegis2026', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'homeowner@aegis.local' },
    update: {},
    create: {
      email: 'homeowner@aegis.local',
      password: hashedPassword,
    },
  });

  console.log(`\n🛡️ Master Homeowner Provisioned: ${user.email}`);
  const zone2 = await prisma.zone.create({
    data: {
      name: 'Backyard',
      isArmed: true,
      devices: {
        create: [
          { name: 'Patio Motion Sensor', type: 'MOTION_SENSOR' },
        ],
      },
    },
  });

  console.log('Seed completed: Zones and Devices created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });