const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const containers = [
  // 🚢 SEA (10 types)
  { 
    mode: 'SEA', 
    name: '20ft Standard', 
    code: '20ST', 
    length: 5898, 
    width: 2352, 
    height: 2393, 
    maxWeight: 28200, 
    volume: 33.2, 
    usage: 'MOST_COMMON',
    description: 'Most common container worldwide, 1 TEU'
  },
  { 
    mode: 'SEA', 
    name: '40ft Standard', 
    code: '40ST', 
    length: 12032, 
    width: 2352, 
    height: 2393, 
    maxWeight: 26680, 
    volume: 67.7, 
    usage: 'MOST_COMMON',
    description: 'Standard container, 2 TEU'
  },
  { 
    mode: 'SEA', 
    name: '40ft High Cube', 
    code: '40HC', 
    length: 12032, 
    width: 2352, 
    height: 2698, 
    maxWeight: 26460, 
    volume: 76.3, 
    usage: 'MOST_COMMON',
    description: 'Extra height for voluminous cargo'
  },
  { 
    mode: 'SEA', 
    name: '45ft High Cube', 
    code: '45HC', 
    length: 13556, 
    width: 2352, 
    height: 2698, 
    maxWeight: 25600, 
    volume: 86.1, 
    usage: 'COMMON',
    description: 'Extended length high cube'
  },
  { 
    mode: 'SEA', 
    name: '20ft High Cube', 
    code: '20HC', 
    length: 5898, 
    width: 2352, 
    height: 2698, 
    maxWeight: 28060, 
    volume: 37.4, 
    usage: 'COMMON',
    description: 'Compact high cube container'
  },
  { 
    mode: 'SEA', 
    name: '20ft Reefer', 
    code: '20RF', 
    length: 5444, 
    width: 2268, 
    height: 2272, 
    maxWeight: 27400, 
    volume: 28.1, 
    usage: 'COMMON',
    isRefrigerated: true,
    description: 'Refrigerated container for perishables'
  },
  { 
    mode: 'SEA', 
    name: '40ft Reefer', 
    code: '40RF', 
    length: 11561, 
    width: 2268, 
    height: 2249, 
    maxWeight: 26630, 
    volume: 59.3, 
    usage: 'COMMON',
    isRefrigerated: true,
    description: 'Large refrigerated container'
  },
  { 
    mode: 'SEA', 
    name: '20ft Open Top', 
    code: '20OT', 
    length: 5893, 
    width: 2346, 
    height: 2353, 
    maxWeight: 28100, 
    volume: 32.5, 
    usage: 'SPECIALIZED',
    description: 'Top-loading for oversized cargo'
  },
  { 
    mode: 'SEA', 
    name: '40ft Flat Rack', 
    code: '40FR', 
    length: 12032, 
    width: 2352, 
    height: 2103, 
    maxWeight: 39200, 
    volume: 62.2, 
    usage: 'SPECIALIZED',
    description: 'Collapsible sides for heavy machinery'
  },
  { 
    mode: 'SEA', 
    name: '20ft ISO Tank', 
    code: '20TK', 
    length: 6058, 
    width: 2438, 
    height: 2591, 
    maxWeight: 36000, 
    volume: 24.0, 
    usage: 'SPECIALIZED',
    description: 'Liquid/chemical transport'
  },

  // ✈️ AIR (6 types)
  { 
    mode: 'AIR', 
    name: 'LD3 Container', 
    code: 'AKE', 
    length: 1534, 
    width: 1562, 
    height: 1143, 
    maxWeight: 1588, 
    volume: 4.3, 
    usage: 'MOST_COMMON',
    contoured: true,
    description: 'Most common air cargo container'
  },
  { 
    mode: 'AIR', 
    name: 'LD3 Reefer', 
    code: 'RKN', 
    length: 1534, 
    width: 1562, 
    height: 1143, 
    maxWeight: 1400, 
    volume: 3.5, 
    usage: 'COMMON',
    contoured: true,
    isRefrigerated: true,
    description: 'Temperature-controlled LD3'
  },
  { 
    mode: 'AIR', 
    name: 'LD7 Pallet', 
    code: 'P1P', 
    length: 3175, 
    width: 2235, 
    height: 1625, 
    maxWeight: 4626, 
    volume: 10.8, 
    usage: 'COMMON',
    contoured: true,
    description: 'Double-width pallet for 777/787'
  },
  { 
    mode: 'AIR', 
    name: 'LD9 Container', 
    code: 'AAP', 
    length: 3175, 
    width: 1562, 
    height: 1625, 
    maxWeight: 4625, 
    volume: 7.8, 
    usage: 'COMMON',
    contoured: false,
    description: 'Rectangular multi-purpose ULD'
  },
  { 
    mode: 'AIR', 
    name: 'PMC Pallet', 
    code: 'PMC', 
    length: 3175, 
    width: 2438, 
    height: 1625, 
    maxWeight: 4536, 
    volume: 12.5, 
    usage: 'MOST_COMMON',
    contoured: false,
    description: 'Universal flat pallet'
  },
  { 
    mode: 'AIR', 
    name: 'LD6 Container', 
    code: 'ALF', 
    length: 3175, 
    width: 1534, 
    height: 1625, 
    maxWeight: 3175, 
    volume: 8.5, 
    usage: 'COMMON',
    contoured: true,
    description: 'Full-width lower deck container'
  },

  // 🚛 ROAD (6 types)
  { 
    mode: 'ROAD', 
    name: '53ft Dry Van', 
    code: '53DV', 
    length: 16154, 
    width: 2591, 
    height: 2743, 
    maxWeight: 20412, 
    volume: 114.8, 
    usage: 'MOST_COMMON',
    doorWidth: 2438,
    doorHeight: 2692,
    description: 'US standard trailer'
  },
  { 
    mode: 'ROAD', 
    name: '48ft Dry Van', 
    code: '48DV', 
    length: 14630, 
    width: 2591, 
    height: 2743, 
    maxWeight: 20412, 
    volume: 104.0, 
    usage: 'COMMON',
    doorWidth: 2438,
    doorHeight: 2692,
    description: 'Common US trailer'
  },
  { 
    mode: 'ROAD', 
    name: '53ft Reefer', 
    code: '53RF', 
    length: 16002, 
    width: 2489, 
    height: 2591, 
    maxWeight: 20000, 
    volume: 103.2, 
    usage: 'COMMON',
    isRefrigerated: true,
    description: 'Refrigerated trailer'
  },
  { 
    mode: 'ROAD', 
    name: '53ft Flatbed', 
    code: '53FB', 
    length: 16154, 
    width: 2591, 
    height: 1524, 
    maxWeight: 21772, 
    volume: 63.8, 
    usage: 'COMMON',
    description: 'Open flatbed for oversized cargo'
  },
  { 
    mode: 'ROAD', 
    name: '26ft Box Truck', 
    code: '26BX', 
    length: 7925, 
    width: 2438, 
    height: 2438, 
    maxWeight: 9979, 
    volume: 47.1, 
    usage: 'COMMON',
    doorWidth: 2286,
    doorHeight: 2286,
    description: 'Medium-duty delivery truck'
  },
  { 
    mode: 'ROAD', 
    name: 'Sprinter Van', 
    code: 'SPRN', 
    length: 4300, 
    width: 1780, 
    height: 1900, 
    maxWeight: 1450, 
    volume: 14.5, 
    usage: 'LAST_MILE',
    description: 'Last-mile delivery van'
  },
];

async function main() {
  console.log('🌱 Seeding containers...');
  
  // Clear existing containers
  await prisma.container.deleteMany();
  
  // Insert all containers
  for (const container of containers) {
    await prisma.container.create({ data: container });
    console.log(`  ✅ ${container.mode} - ${container.name}`);
  }
  
  console.log(`\n✨ Seeded ${containers.length} containers!`);
  
  // Summary by mode
  const summary = containers.reduce((acc, c) => {
    acc[c.mode] = (acc[c.mode] || 0) + 1;
    return acc;
  }, {});
  
  console.log('\n📊 Summary:');
  console.log(`  🚢 SEA:  ${summary.SEA} containers`);
  console.log(`  ✈️  AIR:  ${summary.AIR} containers`);
  console.log(`  🚛 ROAD: ${summary.ROAD} containers`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });