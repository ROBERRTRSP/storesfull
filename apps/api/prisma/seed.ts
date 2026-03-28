import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

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

  const adminEmail = 'admin@demo.local';
  const adminRole = await prisma.role.findUniqueOrThrow({ where: { code: 'ADMIN' } });
  const customerRole = await prisma.role.findUniqueOrThrow({ where: { code: 'CUSTOMER' } });
  const exists = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!exists) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        fullName: 'Admin Demo',
        passwordHash: await argon2.hash('Admin1234'),
        roleId: adminRole.id,
      },
    });
  }

  const customerEmail = 'customer@demo.local';
  const customerUser = await prisma.user.findUnique({ where: { email: customerEmail } });
  if (!customerUser) {
    await prisma.user.create({
      data: {
        email: customerEmail,
        fullName: 'Cliente Demo',
        passwordHash: await argon2.hash('Customer1234'),
        roleId: customerRole.id,
      },
    });
  }

  const sellerRole = await prisma.role.findUniqueOrThrow({ where: { code: 'SELLER' } });
  const deliveryRole = await prisma.role.findUniqueOrThrow({ where: { code: 'DELIVERY' } });
  const sellerEmail = 'seller@demo.local';
  if (!(await prisma.user.findUnique({ where: { email: sellerEmail } }))) {
    await prisma.user.create({
      data: {
        email: sellerEmail,
        fullName: 'Vendedor Demo',
        passwordHash: await argon2.hash('Seller1234'),
        roleId: sellerRole.id,
      },
    });
  }
  const driverEmail = 'driver@demo.local';
  if (!(await prisma.user.findUnique({ where: { email: driverEmail } }))) {
    await prisma.user.create({
      data: {
        email: driverEmail,
        fullName: 'Conductor Demo',
        passwordHash: await argon2.hash('Driver1234'),
        roleId: deliveryRole.id,
      },
    });
  }

  const customer = await prisma.customer.findFirst({ where: { email: customerEmail } });
  if (!customer) {
    await prisma.customer.create({
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

