import { Body, Controller, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ClientPortalService } from './client-portal.service';
import { CreateClientOrderDto } from './dto/create-client-order.dto';
import { UpdateClientProfileDto } from './dto/update-profile.dto';

@ApiTags('client-portal')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('client')
export class ClientPortalController {
  constructor(private readonly service: ClientPortalService) {}

  @Get('bootstrap')
  async bootstrap(@Req() req: Request) {
    const user = req.user as { id: string; role: string };
    const data = await this.service.bootstrap(user.id, user.role);
    return { ...data, viewerRole: user.role };
  }

  @Post('orders')
  createOrder(@Req() req: Request, @Body() dto: CreateClientOrderDto) {
    const user = req.user as { id: string; role: string };
    return this.service.createOrder(user.id, user.role, dto);
  }

  @Post('orders/:id/repeat')
  repeatOrder(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as { id: string; role: string };
    return this.service.repeatOrder(user.id, user.role, id);
  }

  @Put('profile')
  updateProfile(@Req() req: Request, @Body() dto: UpdateClientProfileDto) {
    const user = req.user as { id: string; role: string };
    return this.service.updateProfile(user.id, user.role, dto);
  }
}

