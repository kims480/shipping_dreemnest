import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import type { CreateWorkOrderInput, WorkOrderFilters } from './orders.service';
import { WorkOrderType, WorkOrderStatus } from './entities/work-order.entity';

@ApiTags('orders')
@Controller('work-orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll(
    @Query('reference') reference?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('assignedDfpId') assignedDfpId?: string,
    @Query('merchantName') merchantName?: string,
  ) {
    const filters: WorkOrderFilters = {
      reference,
      type: type as WorkOrderType | undefined,
      status: status as WorkOrderStatus | undefined,
      assignedDfpId,
      merchantName,
    };
    return this.ordersService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateWorkOrderInput) {
    return this.ordersService.create(dto);
  }

  @Patch(':id/advance')
  advance(@Param('id') id: string) {
    return this.ordersService.advanceStage(id);
  }
}
