import { PrismaClient, Role, DiscountType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Admin user
  const adminPassword = await bcrypt.hash('Password1,', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {},
    create: {
      email: 'admin@admin.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'Admin',
      role: Role.ADMIN,
    },
  });

  // Categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Cookware Sets', slug: 'cookware-sets' } }),
    prisma.category.create({ data: { name: 'Blenders', slug: 'blenders' } }),
    prisma.category.create({ data: { name: 'Frying Pans', slug: 'frying-pans' } }),
    prisma.category.create({ data: { name: 'Accessories', slug: 'accessories' } }),
  ]);

  // Sample products
  const products = [
    {
      name: 'Stainless Steel Cookware Set',
      slug: 'stainless-steel-cookware-set',
      description: 'Professional 10-piece set with tri-ply construction.',
      price: 299.99,
      compareAtPrice: 399.99,
      images: ['https://via.placeholder.com/600?text=Stainless+Set'],
      categoryId: categories[0].id,
      brand: 'ChefMate',
      stock: 25,
    },
    {
      name: 'Professional Blender',
      slug: 'professional-blender',
      description: 'High-speed blender for smoothies and soups.',
      price: 149.99,
      images: ['https://via.placeholder.com/600?text=Blender'],
      categoryId: categories[1].id,
      brand: 'BlendPro',
      stock: 40,
    },
    // ... add more as needed
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  // Sample discount code
  await prisma.discountCode.create({
    data: {
      code: 'SAVE10',
      type: DiscountType.PERCENTAGE,
      value: 10,
      minOrderAmount: 50,
      isActive: true,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });