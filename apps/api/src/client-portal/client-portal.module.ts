import { Module } from '@nestjs/common';
import { ProductsModule } from '../products/products.module';
import { ClientPortalController } from './client-portal.controller';
import { ClientPortalService } from './client-portal.service';

@Module({
  imports: [ProductsModule],
  controllers: [ClientPortalController],
  providers: [ClientPortalService],
})
export class ClientPortalModule {}

