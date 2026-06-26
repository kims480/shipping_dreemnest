import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentMethod, PaymentStatus } from './entities/payment.entity';

interface RecordPaymentInput {
  workOrderId: string;
  method: PaymentMethod;
  amount: string;
  currency?: string;
}

@Injectable()
export class AccountingService {
  constructor(@InjectRepository(Payment) private readonly paymentRepo: Repository<Payment>) {}

  findAll(status?: PaymentStatus, method?: PaymentMethod): Promise<Payment[]> {
    const where: Record<string, unknown> = {};
    if (status) where['status'] = status;
    if (method) where['method'] = method;
    return this.paymentRepo.find({ where: where as never, order: { createdAt: 'DESC' } });
  }

  findByWorkOrder(workOrderId: string): Promise<Payment[]> {
    return this.paymentRepo.find({ where: { workOrderId } });
  }

  recordPayment(input: RecordPaymentInput): Promise<Payment> {
    const payment = this.paymentRepo.create({
      workOrderId: input.workOrderId,
      method: input.method,
      amount: input.amount,
      currency: input.currency ?? 'SAR',
      status: input.method === PaymentMethod.COD ? PaymentStatus.PENDING : PaymentStatus.COLLECTED,
    });
    return this.paymentRepo.save(payment);
  }

  async reconcile(id: string): Promise<Payment | null> {
    await this.paymentRepo.update(id, { status: PaymentStatus.RECONCILED, reconciledAt: new Date() });
    return this.paymentRepo.findOne({ where: { id } });
  }
}
