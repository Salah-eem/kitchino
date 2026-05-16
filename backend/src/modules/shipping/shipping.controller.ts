import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ShippingService } from './shipping.service';

@Controller('shipping')
export class ShippingController {
  constructor(private shippingService: ShippingService) {}

  @Get('options')
  getShippingOptions(@Query('orderAmount') orderAmount?: string) {
    const amount = orderAmount ? parseFloat(orderAmount) : 0;
    return this.shippingService.getShippingOptions(amount);
  }

  @Get('option/:id')
  getShippingOption(@Param('id') id: string) {
    return this.shippingService.getShippingOption(id);
  }

  @Post('calculate')
  calculateShippingCost(
    @Body('shippingOptionId') shippingOptionId: string,
    @Body('orderAmount') orderAmount?: number,
  ) {
    const cost = this.shippingService.calculateShippingCost(shippingOptionId, orderAmount);
    return { cost };
  }

  @Get('delivery-date/:shippingOptionId')
  estimateDeliveryDate(@Param('shippingOptionId') shippingOptionId: string) {
    const date = this.shippingService.estimateDeliveryDate(shippingOptionId);
    return { estimatedDeliveryDate: date };
  }

  @Post('validate-address')
  validateAddress(
    @Body() address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    },
  ) {
    const isValid = this.shippingService.validateAddress(address);
    return { isValid };
  }

  @Post('generate-tracking')
  generateTrackingNumber() {
    const trackingNumber = this.shippingService.generateTrackingNumber();
    return { trackingNumber };
  }
}
