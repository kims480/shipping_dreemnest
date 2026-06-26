import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { AccountingService } from './accounting.service';
import { AccountingController } from './accounting.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Payment])],
  providers: [AccountingService],
  controllers: [AccountingController],
  exports: [AccountingService, TypeOrmModule],
})
export class AccountingModule {}
