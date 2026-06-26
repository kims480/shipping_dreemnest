import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AccountingService } from './accounting.service';
import { PaymentMethod, PaymentStatus } from './entities/payment.entity';

interface RecordPaymentDto {
  workOrderId: string;
  method: PaymentMethod;
  amount: string;
  currency?: string;
}

@ApiTags('accounting')
@Controller('payments')
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('method') method?: string,
  ) {
    return this.accountingService.findAll(
      status as PaymentStatus | undefined,
      method as PaymentMethod | undefined,
    );
  }

  @Get('work-order/:workOrderId')
  findByWorkOrder(@Param('workOrderId') workOrderId: string) {
    return this.accountingService.findByWorkOrder(workOrderId);
  }

  @Post()
  record(@Body() dto: RecordPaymentDto) {
    return this.accountingService.recordPayment(dto);
  }

  @Patch(':id/reconcile')
  reconcile(@Param('id') id: string) {
    return this.accountingService.reconcile(id);
  }
}
