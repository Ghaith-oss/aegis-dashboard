// apps/api/prisma/seed.ts
import { PrismaClient } from '@prisma/client';

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