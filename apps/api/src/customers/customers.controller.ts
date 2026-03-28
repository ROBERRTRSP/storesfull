import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UpsertCustomerDto } from './dto/upsert-customer.dto';
import { CustomersService } from './customers.service';

@ApiTags('customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customers: CustomersService) {}

  @Get()
  @Roles('ADMIN', 'SELLER')
  findAll() {
    return this.customers.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'SELLER')
  findOne(@Param('id') id: string) {
    return this.customers.findOne(id);
  }

  @Post()
  @Roles('ADMIN')
  create(@Body() dto: UpsertCustomerDto) {
    return this.customers.create(dto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() dto: UpsertCustomerDto) {
    return this.customers.update(id, dto);
  }
}

