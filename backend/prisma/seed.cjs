const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const containers = [
  {
    name: '20ft Standard',
    code: '20ST',
    length: 5898,
    width: 2352,
    height: 2393,
    maxWeight: 28200,
    volume: 33.2,
    description: 'Standard 20-foot shipping container'
  },
  {
    name: '40ft Standard',
    code: '40ST',
    length: 12032,
    width: 2352,
    height: 2393,
    maxWeight: 26700,
    volume: 67.7,
    description: 'Standard 40-foot shipping container'
  },
  {
    name: '40ft High Cube',
    code: '40HC',
    length: 12032,
    width: 2352,
    height: 2698,
    maxWeight: 26460,
    volume: 76.3,
    description: '40-foot container with extra height'
  },
  {
    name: 'Euro Pallet',
    code: 'EPAL',
    length: 1200,
    width: 800,
    height: 1450,
    maxWeight: 1500,
    volume: 1.4,
    description: 'Standard Euro pallet footprint'
  },
  {
    name: '45ft High Cube',
    code: '45HC',
    length: 13556,
    width: 2352,
    height: 2698,
    maxWeight: 27600,
    volume: 86.1,
    description: 'Extra long high cube container'
  }
];

async function main() {
  console.log('Seeding containers...');
  
  for (const container of containers) {
    await prisma.container.upsert({
      where: { code: container.code },
      update: container,
      create: container
    });
    console.log(`  ✓ ${container.name}`);
  }
  
  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });