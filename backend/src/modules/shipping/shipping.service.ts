import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';

export interface ShippingOption {
  id: string;
  name: string;
  cost: number;
  estimatedDays: number;
  description: string;
}

@Injectable()
export class ShippingService {
  private shippingOptions: ShippingOption[] = [
    {
      id: 'standard',
      name: 'Standard Shipping',
      cost: 9.99,
      estimatedDays: 5,
      description: 'Delivery in 5-7 business days',
    },
    {
      id: 'express',
      name: 'Express Shipping',
      cost: 19.99,
      estimatedDays: 2,
      description: 'Delivery in 2-3 business days',
    },
    {
      id: 'overnight',
      name: 'Overnight Shipping',
      cost: 39.99,
      estimatedDays: 1,
      description: 'Next day delivery',
    },
    {
      id: 'free',
      name: 'Free Shipping',
      cost: 0,
      estimatedDays: 7,
      description: 'Free shipping for orders over $50',
    },
  ];

  getShippingOptions(orderAmount: number = 0) {
    // Free shipping for orders over $50
    return this.shippingOptions.map((option) => {
      if (option.id === 'free' && orderAmount >= 50) {
        return option;
      } else if (option.id !== 'free') {
        return option;
      }
      return null;
    }).filter(Boolean);
  }

  getShippingOption(id: string) {
    const option = this.shippingOptions.find((opt) => opt.id === id);
    if (!option) throw new NotFoundException('Shipping option not found');
    return option;
  }

  calculateShippingCost(shippingOptionId: string, orderAmount: number = 0): number {
    const option = this.getShippingOption(shippingOptionId);

    // Apply free shipping for orders over $50
    if (option.id === 'free' || (option.cost === 0 && orderAmount >= 50)) {
      return 0;
    }

    return option.cost;
  }

  estimateDeliveryDate(shippingOptionId: string): Date {
    const option = this.getShippingOption(shippingOptionId);
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + option.estimatedDays);
    return deliveryDate;
  }

  validateAddress(address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }) {
    if (!address.street || !address.city || !address.state || !address.zipCode || !address.country) {
      throw new BadRequestException('Invalid shipping address');
    }
    return true;
  }

  generateTrackingNumber(): string {
    return `TRK-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  }
}
