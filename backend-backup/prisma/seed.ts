import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.inquiry.deleteMany();
  await prisma.product.deleteMany();

  // Seed Products - Resin Art
  const resinProducts = await Promise.all([
    prisma.product.create({
      data: {
        title: 'QUORIN Crystal Clear Epoxy Resin and Hardener Kit',
        description: 'Premium crystal clear epoxy resin with high gloss finish, perfect for professional resin art.',
        price: 999,
        mrp: 1549,
        discount: '36%',
        stock: 50,
        featured: true,
        category: 'resin-art',
        tags: ['resin', 'epoxy', 'art', 'jewelry', 'crafts'],
        images: ['https://via.placeholder.com/500?text=Resin+Kit'],
      },
    }),
    prisma.product.create({
      data: {
        title: 'Liquid Resin Pigment Combo Set',
        description: 'Highly concentrated liquid pigments for vibrant colors in resin art.',
        price: 284,
        mrp: 989,
        discount: '71%',
        stock: 100,
        featured: true,
        category: 'resin-art',
        tags: ['pigments', 'colors', 'resin-art'],
        images: ['https://via.placeholder.com/500?text=Pigment+Set'],
      },
    }),
    prisma.product.create({
      data: {
        title: 'QUORIN Resin Tools Kit',
        description: 'Complete 23-piece tool kit for resin art finishing and polishing.',
        price: 1429,
        mrp: 2999,
        discount: '52%',
        stock: 30,
        featured: true,
        category: 'resin-art',
        tags: ['tools', 'drill', 'polishing', 'finishing'],
        images: ['https://via.placeholder.com/500?text=Tools+Kit'],
      },
    }),
  ]);

  // Seed Products - Candle Making
  const candleProducts = await Promise.all([
    prisma.product.create({
      data: {
        title: 'QUORIN Candle Colour Set',
        description: 'Professional candle colors in 8 vibrant shades compatible with all wax types.',
        price: 579,
        mrp: 2000,
        discount: '71%',
        stock: 75,
        featured: true,
        category: 'candle-making',
        tags: ['candle-color', 'wax-dye'],
        images: ['https://via.placeholder.com/500?text=Candle+Colors'],
      },
    }),
    prisma.product.create({
      data: {
        title: 'QUORIN Candle Wicks',
        description: '50-piece pack of 4-inch cotton wicks for jar candle making.',
        price: 189,
        mrp: 1000,
        discount: '81%',
        stock: 120,
        featured: false,
        category: 'candle-making',
        tags: ['wicks', 'cotton', 'candle-making'],
        images: ['https://via.placeholder.com/500?text=Candle+Wicks'],
      },
    }),
    prisma.product.create({
      data: {
        title: 'Premium Fragrance Oil Set',
        description: 'Pack of 6 long-lasting fragrance oils for premium candle making.',
        price: 299,
        mrp: 2000,
        discount: '85%',
        stock: 60,
        featured: true,
        category: 'candle-making',
        tags: ['fragrance-oil', 'candle-making'],
        images: ['https://via.placeholder.com/500?text=Fragrance+Oils'],
      },
    }),
  ]);

  // Seed Products - Soap Making
  const soapProducts = await Promise.all([
    prisma.product.create({
      data: {
        title: 'Quorin DIY Soap Colouring Kit',
        description: 'Beginner-friendly soap coloring kit with 8 vibrant colors and easy-to-use format.',
        price: 198,
        mrp: 1000,
        discount: '80%',
        stock: 90,
        featured: true,
        category: 'soap-making',
        tags: ['soap-color', 'melt-and-pour'],
        images: ['https://via.placeholder.com/500?text=Soap+Colors'],
      },
    }),
    prisma.product.create({
      data: {
        title: 'QUORIN Liquid Soap Colour Kit with Silicone Mold',
        description: 'Complete soap making kit with colors and silicone molds for easy handmade soap creation.',
        price: 284,
        mrp: 1000,
        discount: '72%',
        stock: 45,
        featured: true,
        category: 'soap-making',
        tags: ['soap-color', 'silicone-mold', 'handmade-soap'],
        images: ['https://via.placeholder.com/500?text=Soap+Kit'],
      },
    }),
  ]);

  console.log('✓ Products seeded:', resinProducts.length + candleProducts.length + soapProducts.length);

  // Seed sample inquiry
  const inquiry = await prisma.inquiry.create({
    data: {
      customerName: 'Sample Customer',
      customerEmail: 'customer@example.com',
      customerPhone: '+91-9000000000',
      customerMessage: 'I am interested in bulk orders for resin kits.',
      productId: resinProducts[0].id,
      status: 'pending',
    },
  });

  console.log('✓ Sample inquiry created');
  console.log('🌱 Database seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
