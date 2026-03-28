import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';

@Module({
  imports: [AuthModule],
  controllers: [CustomersController],
  providers: [CustomersService, RolesGuard],
})
export class CustomersModule {}

