import { Controller, Post, Req, Headers, Body, RawBodyRequest } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { Request } from 'express';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') sig: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    return this.paymentsService.handleWebhook(sig, req.rawBody!);
  }

  @Post('paypal/capture')
  async capturePayPalOrder(@Body('orderId') orderId: string) {
    return this.paymentsService.capturePayPalOrder(orderId);
  }
}