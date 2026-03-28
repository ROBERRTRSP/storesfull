import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const roles = [
    { code: 'ADMIN', name: 'Administrador' },
    { code: 'CUSTOMER', name: 'Cliente' },
    { code: 'DELIVERY', name: 'Delivery / Comprador' },
    { code: 'SELLER', name: 'Vendedor' },
  ];

  for (const r of roles) {
    await prisma.role.upsert({
      where: { code: r.code },
      update: { name: r.name },
      create: { code: r.code, name: r.name },
    });
  }

  const adminRole = await prisma.role.findUniqueOrThrow({ where: { code: 'ADMIN' } });
  const customerRole = await prisma.role.findUniqueOrThrow({ where: { code: 'CUSTOMER' } });
  const sellerRole = await prisma.role.findUniqueOrThrow({ where: { code: 'SELLER' } });
  const deliveryRole = await prisma.role.findUniqueOrThrow({ where: { code: 'DELIVERY' } });

  /** Siempre actualiza el hash para que coincida con el README tras migraciones Argon2 → bcrypt. */
  async function seedDemoUser(
    email: string,
    fullName: string,
    plainPassword: string,
    roleId: string,
  ) {
    const passwordHash = await bcrypt.hash(plainPassword, 12);
    await prisma.user.upsert({
      where: { email },
      update: { passwordHash, fullName, roleId, status: 'ACTIVE' },
      create: { email, fullName, passwordHash, roleId },
    });
  }

  const adminEmail = 'admin@demo.local';
  await seedDemoUser(adminEmail, 'Admin Demo', 'Admin1234', adminRole.id);

  const customerEmail = 'customer@demo.local';
  await seedDemoUser(customerEmail, 'Cliente Demo', 'Customer1234', customerRole.id);

  const sellerEmail = 'seller@demo.local';
  await seedDemoUser(sellerEmail, 'Vendedor Demo', 'Seller1234', sellerRole.id);

  const driverEmail = 'driver@demo.local';
  await seedDemoUser(driverEmail, 'Conductor Demo', 'Driver1234', deliveryRole.id);

  let customer = await prisma.customer.findFirst({ where: { email: customerEmail } });
  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        businessName: 'Bodega La 9',
        contactName: 'Carlos Perez',
        phone: '+1 786 000 0000',
        email: customerEmail,
        address: 'Miami, FL',
        notes: '[weekly_reminder=true]',
      },
    });
  }

  const sellerUser = await prisma.user.findUnique({ where: { email: sellerEmail } });
  if (sellerUser && customer) {
    await prisma.customerAssignment.upsert({
      where: {
        customerId_sellerId: { customerId: customer.id, sellerId: sellerUser.id },
      },
      update: {},
      create: { customerId: customer.id, sellerId: sellerUser.id },
    });
  }

  const category = await prisma.productCategory.upsert({
    where: { name: 'Despensa' },
    update: {},
    create: { name: 'Despensa' },
  });
  const productSeeds = [
    { name: 'Arroz 1kg', sku: 'ARROZ-1KG', unit: 'unidad', salePrice: 2.5, referenceCost: 1.8, tags: ['promo semanal'] },
    { name: 'Aceite 1L', sku: 'ACEITE-1L', unit: 'unidad', salePrice: 4.2, referenceCost: 3.1, tags: [] },
    { name: 'Pasta 500g', sku: 'PASTA-500', unit: 'unidad', salePrice: 1.9, referenceCost: 1.2, tags: ['combo pasta + salsa'] },
  ];
  for (const p of productSeeds) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {
        name: p.name,
        categoryId: category.id,
        unit: p.unit,
        salePrice: p.salePrice,
        referenceCost: p.referenceCost,
        tags: p.tags,
      },
      create: {
        name: p.name,
        categoryId: category.id,
        sku: p.sku,
        unit: p.unit,
        salePrice: p.salePrice,
        referenceCost: p.referenceCost,
        tags: p.tags,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

