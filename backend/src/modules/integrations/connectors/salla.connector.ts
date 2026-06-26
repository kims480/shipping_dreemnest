import { Injectable, Logger } from '@nestjs/common';

export interface SallaOrderPayload {
  orderId: string;
  merchantName: string;
  customerName: string;
  customerPhone: string;
  addressLine: string;
  city: string;
}

export interface NormalizedWorkOrderIntake {
  reference: string;
  merchantName: string;
  customerName: string;
  customerPhone: string;
  addressLine: string;
  city: string;
}

/**
 * Salla.com webhook/API connector (PDR §5 round-2 requirement: WO intake via
 * Salla integration). This stub normalizes the vendor payload into the shape
 * `OrdersService.create` expects; wire the real webhook signature
 * verification and OAuth token exchange here once Salla credentials exist.
 */
@Injectable()
export class SallaConnector {
  private readonly logger = new Logger(SallaConnector.name);

  normalizeOrder(payload: SallaOrderPayload): NormalizedWorkOrderIntake {
    this.logger.debug(`Normalizing Salla order ${payload.orderId}`);
    return {
      reference: `SALLA-${payload.orderId}`,
      merchantName: payload.merchantName,
      customerName: payload.customerName,
      customerPhone: payload.customerPhone,
      addressLine: payload.addressLine,
      city: payload.city,
    };
  }
}
