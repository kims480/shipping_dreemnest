import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryConfirmation } from './entities/delivery-confirmation.entity';
import { Rating } from './entities/rating.entity';
import { FulfillmentService } from './fulfillment.service';
import { FulfillmentController } from './fulfillment.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryConfirmation, Rating])],
  providers: [FulfillmentService],
  controllers: [FulfillmentController],
  exports: [FulfillmentService, TypeOrmModule],
})
export class FulfillmentModule {}
