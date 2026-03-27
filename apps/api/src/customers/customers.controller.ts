import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UpsertCustomerDto } from './dto/upsert-customer.dto';
import { CustomersService } from './customers.service';

@ApiTags('customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly customers: CustomersService) {}

  @Get()
  findAll() {
    return this.customers.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customers.findOne(id);
  }

  @Post()
  create(@Body() dto: UpsertCustomerDto) {
    return this.customers.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpsertCustomerDto) {
    return this.customers.update(id, dto);
  }
}

