import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveForCatalog() {
    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });
    return products.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category?.name ?? 'General',
      price: Number(p.salePrice),
      unit: p.unit,
      promo: p.tags?.find((t) => t.toLowerCase().includes('promo')) ?? null,
      combo: p.tags?.find((t) => t.toLowerCase().includes('combo')) ?? null,
    }));
  }
}

