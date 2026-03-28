import { prisma } from "@/lib/prisma";

export async function findActiveForCatalog() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
  return products.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category?.name ?? "General",
    price: Number(p.salePrice),
    unit: p.unit,
    promo: p.tags?.find((t) => t.toLowerCase().includes("promo")) ?? null,
    combo: p.tags?.find((t) => t.toLowerCase().includes("combo")) ?? null,
    sku: p.sku ?? p.id,
    imageUrl: p.imageUrl ?? null,
    referenceCost: p.referenceCost != null ? Number(p.referenceCost) : 0,
    isActive: p.isActive,
    tags: p.tags ?? [],
  }));
}
