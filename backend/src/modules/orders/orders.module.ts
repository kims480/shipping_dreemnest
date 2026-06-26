import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkOrder } from './entities/work-order.entity';
import { EFlowStage } from './entities/e-flow-stage.entity';
import { EndCustomer } from './entities/end-customer.entity';
import { Address } from './entities/address.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { EndCustomersController } from './end-customers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WorkOrder, EFlowStage, EndCustomer, Address])],
  providers: [OrdersService],
  controllers: [OrdersController, EndCustomersController],
  exports: [OrdersService, TypeOrmModule],
})
export class OrdersModule {}
