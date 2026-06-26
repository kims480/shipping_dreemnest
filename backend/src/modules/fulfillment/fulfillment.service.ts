import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryConfirmation } from './entities/delivery-confirmation.entity';
import { Rating } from './entities/rating.entity';

interface ConfirmDeliveryInput {
  workOrderId: string;
  signedByName: string;
  signatureImageUrl?: string;
  satisfactionAnswers?: Record<string, string | number | boolean>;
  remarks?: string;
}

interface SubmitRatingInput {
  workOrderId: string;
  score: number;
  comment?: string;
}

@Injectable()
export class FulfillmentService {
  constructor(
    @InjectRepository(DeliveryConfirmation)
    private readonly confirmationRepo: Repository<DeliveryConfirmation>,
    @InjectRepository(Rating) private readonly ratingRepo: Repository<Rating>,
  ) {}

  confirmDelivery(input: ConfirmDeliveryInput): Promise<DeliveryConfirmation> {
    const confirmation = this.confirmationRepo.create({
      workOrderId: input.workOrderId,
      signedByName: input.signedByName,
      signatureImageUrl: input.signatureImageUrl ?? null,
      satisfactionAnswers: input.satisfactionAnswers ?? {},
      remarks: input.remarks ?? null,
    });
    return this.confirmationRepo.save(confirmation);
  }

  submitRating(input: SubmitRatingInput): Promise<Rating> {
    const rating = this.ratingRepo.create({
      workOrderId: input.workOrderId,
      score: input.score,
      comment: input.comment ?? null,
    });
    return this.ratingRepo.save(rating);
  }
}
