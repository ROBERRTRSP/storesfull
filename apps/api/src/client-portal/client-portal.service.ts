import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service';
import { CreateClientOrderDto } from './dto/create-client-order.dto';
import { UpdateClientProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ClientPortalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly products: ProductsService,
  ) {}

  private mapOrderStatus(status: string) {
    const map: Record<string, string> = {
      DRAFT: 'borrador',
      CONFIRMED: 'confirmado',
      CLOSED_FOR_EDITING: 'pendiente_de_compra',
      PENDING_PURCHASE: 'pendiente_de_compra',
      IN_PURCHASE: 'en_compra',
      PURCHASED: 'comprado',
      IN_ROUTE: 'en_ruta',
      DELIVERED: 'entregado',
      PARTIAL: 'parcial',
      CANCELLED: 'cancelado',
      PAYMENT_PENDING: 'pendiente_de_pago',
      PAID: 'pagado',
    };
    return map[status];
  }

  private async getCustomerForUser(userId: string, role: string) {
    if (role !== 'CUSTOMER') {
      throw new ForbiddenException(
        'El portal de cliente solo está disponible para cuentas con rol CLIENTE.',
      );
    }
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const customer = await this.prisma.customer.findFirst({
      where: { email: { equals: user.email, mode: 'insensitive' } },
      orderBy: { createdAt: 'asc' },
    });
    if (!customer) {
      throw new NotFoundException(
        'No hay un perfil de cliente vinculado a tu correo. Contacta al administrador.',
      );
    }
    return customer;
  }

  private orderTotal(items: { lineTotal: any }[]) {
    return items.reduce((sum, it) => sum + Number(it.lineTotal), 0);
  }

  /** Solo digitos para mostrar factura/pedido al cliente (sin prefijos tipo ORD-). */
  private onlyDigits(value: string): string {
    const digits = value.replace(/\D/g, '');
    return digits.length > 0 ? digits : value;
  }

  private nextNumericOrderNumber(): string {
    return `${Date.now()}${Math.floor(100 + Math.random() * 900)}`;
  }

  async bootstrap(userId: string, role: string) {
    const customer = await this.getCustomerForUser(userId, role);
    const [products, orders, payments] = await Promise.all([
      this.products.findActiveForCatalog(),
      this.prisma.order.findMany({
        where: { customerId: customer.id },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.payment.findMany({
        where: { customerId: customer.id },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const mappedOrders = orders.map((o) => ({
      id: o.id,
      orderNumber: this.onlyDigits(o.orderNumber),
      createdAt: o.createdAt.toISOString().slice(0, 10),
      status: this.mapOrderStatus(o.status),
      items: o.items.map((it) => ({ productId: it.productId, qty: it.qty })),
      note: o.notes ?? undefined,
      total: this.orderTotal(o.items),
    }));

    const orderById = new Map(orders.map((o) => [o.id, o]));

    const paid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const invoiced = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const pendingBalance = Math.max(invoiced - paid, 0);

    const documents = [
      ...orders.map((o) => ({
        id: `inv-${o.id}`,
        number: this.onlyDigits(o.orderNumber),
        type: 'factura' as const,
        orderId: o.id,
        orderNumber: this.onlyDigits(o.orderNumber),
        date: o.createdAt.toISOString().slice(0, 10),
        total: Number(o.total),
      })),
      ...payments.map((p) => {
        const linked = p.orderId ? orderById.get(p.orderId) : undefined;
        return {
          id: `rcp-${p.id}`,
          number: String(p.createdAt.getTime()),
          type: 'recibo' as const,
          orderId: p.orderId ?? 'sin-pedido',
          orderNumber: linked ? this.onlyDigits(linked.orderNumber) : undefined,
          date: p.createdAt.toISOString().slice(0, 10),
          total: Number(p.amount),
        };
      }),
    ];

    return {
      profile: {
        businessName: customer.businessName,
        contactName: customer.contactName ?? '',
        phone: customer.phone ?? '',
        email: customer.email ?? '',
        address: customer.address ?? '',
        weeklyReminder: customer.notes?.includes('[weekly_reminder=true]') ?? true,
      },
      products,
      orders: mappedOrders,
      payments: payments.map((p) => ({
        id: p.id,
        date: p.createdAt.toISOString().slice(0, 10),
        amount: Number(p.amount),
        method: p.method,
      })),
      documents,
      pendingBalance,
    };
  }

  async createOrder(userId: string, role: string, dto: CreateClientOrderDto) {
    const customer = await this.getCustomerForUser(userId, role);
    const productIds = [...new Set(dto.items.map((i) => i.productId))];
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });
    if (products.length !== productIds.length) {
      throw new NotFoundException('One or more products were not found');
    }
    const byId = new Map<string, (typeof products)[number]>(products.map((p) => [p.id, p]));
    const subtotal = dto.items.reduce((sum, it) => {
      const p = byId.get(it.productId)!;
      return sum + Number(p.salePrice) * it.qty;
    }, 0);

    const order = await this.prisma.order.create({
      data: {
        orderNumber: this.nextNumericOrderNumber(),
        customerId: customer.id,
        createdById: userId,
        status: dto.mode === 'draft' ? 'DRAFT' : 'CONFIRMED',
        notes: dto.note,
        subtotal,
        total: subtotal,
        items: {
          create: dto.items.map((it) => {
            const p = byId.get(it.productId)!;
            const unitPrice = Number(p.salePrice);
            return {
              productId: it.productId,
              qty: it.qty,
              unitPrice,
              lineTotal: unitPrice * it.qty,
            };
          }),
        },
      },
      include: { items: true },
    });

    return {
      id: order.id,
      orderNumber: this.onlyDigits(order.orderNumber),
      createdAt: order.createdAt.toISOString().slice(0, 10),
      status: this.mapOrderStatus(order.status),
      items: order.items.map((it) => ({ productId: it.productId, qty: it.qty })),
      note: order.notes ?? undefined,
    };
  }

  async repeatOrder(userId: string, role: string, orderId: string) {
    const customer = await this.getCustomerForUser(userId, role);
    const source = await this.prisma.order.findFirst({
      where: { id: orderId, customerId: customer.id },
      include: { items: true },
    });
    if (!source) throw new NotFoundException('Order not found');
    return this.createOrder(userId, role, {
      mode: 'draft',
      items: source.items.map((it) => ({ productId: it.productId, qty: it.qty })),
      note: `Repetido de ${this.onlyDigits(source.orderNumber)}`,
    });
  }

  async updateProfile(userId: string, role: string, dto: UpdateClientProfileDto) {
    const customer = await this.getCustomerForUser(userId, role);
    const notes = dto.weeklyReminder === undefined
      ? customer.notes
      : `${(customer.notes ?? '').replace('[weekly_reminder=true]', '').replace('[weekly_reminder=false]', '').trim()} [weekly_reminder=${dto.weeklyReminder ? 'true' : 'false'}]`.trim();

    const updated = await this.prisma.customer.update({
      where: { id: customer.id },
      data: {
        businessName: dto.businessName ?? customer.businessName,
        contactName: dto.contactName ?? customer.contactName,
        phone: dto.phone ?? customer.phone,
        email: dto.email ?? customer.email,
        address: dto.address ?? customer.address,
        notes,
      },
    });
    return {
      businessName: updated.businessName,
      contactName: updated.contactName ?? '',
      phone: updated.phone ?? '',
      email: updated.email ?? '',
      address: updated.address ?? '',
      weeklyReminder: notes?.includes('[weekly_reminder=true]') ?? true,
    };
  }
}

