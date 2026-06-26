import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FulfillmentService } from './fulfillment.service';

interface ConfirmDeliveryDto {
  workOrderId: string;
  signedByName: string;
  signatureImageUrl?: string;
  satisfactionAnswers?: Record<string, string | number | boolean>;
  remarks?: string;
}

interface SubmitRatingDto {
  workOrderId: string;
  score: number;
  comment?: string;
}

@ApiTags('fulfillment')
@Controller('fulfillment')
export class FulfillmentController {
  constructor(private readonly fulfillmentService: FulfillmentService) {}

  @Post('delivery-confirmations')
  confirmDelivery(@Body() dto: ConfirmDeliveryDto) {
    return this.fulfillmentService.confirmDelivery(dto);
  }

  @Post('ratings')
  submitRating(@Body() dto: SubmitRatingDto) {
    return this.fulfillmentService.submitRating(dto);
  }
}
