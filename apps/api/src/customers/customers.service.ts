import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertCustomerDto } from './dto/upsert-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.customer.findMany({ orderBy: { createdAt: 'desc' } });
  }

  findOne(id: string) {
    return this.prisma.customer.findUnique({ where: { id } });
  }

  create(dto: UpsertCustomerDto) {
    return this.prisma.customer.create({
      data: {
        businessName: dto.businessName,
        contactName: dto.contactName,
        phone: dto.phone,
        email: dto.email,
        address: dto.address,
        gpsLink: dto.gpsLink,
        zone: dto.zone,
        visitDay: dto.visitDay,
        creditLimit: dto.creditLimit,
        creditDays: dto.creditDays ? Math.trunc(dto.creditDays) : undefined,
        notes: dto.notes,
      },
    });
  }

  update(id: string, dto: UpsertCustomerDto) {
    return this.prisma.customer.update({
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
        creditLimit: dto.creditLimit,
        creditDays: dto.creditDays ? Math.trunc(dto.creditDays) : undefined,
        notes: dto.notes,
      },
    });
  }
}

