import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type UpsertCustomerBody = {
  businessName: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  gpsLink?: string;
  zone?: string;
  visitDay?: string;
  creditLimit?: number;
  creditDays?: number;
  notes?: string;
};

export function customersFindAll() {
  return prisma.customer.findMany({ orderBy: { createdAt: "desc" } });
}

export function customersFindOne(id: string) {
  return prisma.customer.findUnique({ where: { id } });
}

export function customersCreate(dto: UpsertCustomerBody) {
  return prisma.customer.create({
    data: {
      businessName: dto.businessName,
      contactName: dto.contactName,
      phone: dto.phone,
      email: dto.email,
      address: dto.address,
      gpsLink: dto.gpsLink,
      zone: dto.zone,
      visitDay: dto.visitDay,
      creditLimit:
        dto.creditLimit != null ? new Prisma.Decimal(dto.creditLimit) : undefined,
      creditDays: dto.creditDays != null ? Math.trunc(dto.creditDays) : undefined,
      notes: dto.notes,
    },
  });
}

export function customersUpdate(id: string, dto: UpsertCustomerBody) {
  return prisma.customer.update({
    where: { id },
    data: {
      businessName: dto.businessName,
      contactName: dto.contactName,
      phone: dto.phone,
      email: dto.email,
      address: dto.address,
      gpsLink: dto.gpsLink,
      zone: dto.zone,
      visitDay: dto.visitDay,
      creditLimit:
        dto.creditLimit != null ? new Prisma.Decimal(dto.creditLimit) : undefined,
      creditDays: dto.creditDays != null ? Math.trunc(dto.creditDays) : undefined,
      notes: dto.notes,
    },
  });
}
