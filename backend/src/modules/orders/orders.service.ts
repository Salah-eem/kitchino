import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PromotionsService } from '../promotions/promotions.service';
import { PaymentsService } from '../payments/payments.service';
import Stripe from 'stripe';
import { Role, User } from '@prisma/client';

@Injectable()
export class OrdersService {
  private stripe: Stripe;

  constructor(
    private prisma: PrismaService,
    private promotionsService: PromotionsService,
    private paymentsService: PaymentsService
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { 
      apiVersion: '2023-10-16' as any 
    });
  }

  async createCheckoutSession(userId: string, discountCode?: string) {
    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });
    if (!cartItems.length) throw new BadRequestException('Cart is empty');

    // Apply discount
    let discount = 0;
    let discountCodeId: string | undefined;
    if (discountCode) {
      const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      try {
        const validated = await this.promotionsService.validateDiscount(discountCode, subtotal);
        discount = validated.discountAmount;
        discountCodeId = validated.id;
      } catch (error) {
        throw new BadRequestException(error.message);
      }
    }

    const lineItems = cartItems.map(item => {
      const image = item.product.images && item.product.images.length > 0 
        ? item.product.images[0] 
        : (item.product as any).image; // fallback to single image if array is empty
        
      return {
        price_data: {
          currency: 'usd',
          product_data: { 
            name: item.product.name, 
            images: image ? [image] : [] 
          },
          unit_amount: Math.round(item.product.price * 100),
        },
        quantity: item.quantity,
      };
    });

    // Save order in DB
    const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const shipping = subtotal > 0 ? 10 : 0; // matching frontend logic
    const tax = subtotal * 0.1; // 10% tax
    const finalTotal = Math.max(subtotal - discount + shipping + tax, 0);
    const order = await this.prisma.order.create({
      data: {
        userId,
        total: finalTotal,
        shippingAddress: {}, // will be updated from webhook or frontend later
        discountCodeId: discountCodeId,
        items: {
          create: cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
          })),
        },
      },
    });

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/checkout/success?orderId=${order.id}`,
      cancel_url: `${process.env.FRONTEND_URL}/cart`,
      metadata: { orderId: order.id, userId },
    });
    return { url: session.url, orderId: order.id };
  }

  async create(userId: string, data: any) {
    try {
      const { items, shippingAddress, discountCode, paymentMethod = 'CARD' } = data;

      // 1. Calculate items and subtotal
      let subtotal = 0;
      const orderItems: any[] = [];
      for (const item of items) {
        const product = await this.prisma.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new BadRequestException(`Product ${item.productId} not found`);
        subtotal += product.price * item.quantity;
        orderItems.push({
          productId: product.id,
          name: product.name,
          quantity: item.quantity,
          price: product.price,
        });
      }

      // 2. Validate discount
      let discountAmount = 0;
      let discountCodeId: string | undefined;
      if (discountCode) {
        try {
          const validated = await this.promotionsService.validateDiscount(discountCode, subtotal);
          discountAmount = validated.discountAmount;
          discountCodeId = validated.id;
        } catch (error) {
          throw new BadRequestException(error.message);
        }
      }

      // 3. Calculate final amounts
      const shipping = subtotal > 0 ? 10 : 0;
      const tax = subtotal * 0.1;
      const finalTotal = Math.max(subtotal - discountAmount + shipping + tax, 0);

      // 4. Create Order in DB
      const order = await this.prisma.order.create({
        data: {
          userId,
          total: finalTotal,
          discountCodeId,
          shippingAddress: shippingAddress || {},
          paymentMethod: paymentMethod as any,
          items: {
            create: orderItems.map(({ name, ...item }) => item),
          },
        },
      });

      // 6. Handle Payment Flow
      if (paymentMethod === 'CARD') {
        const lineItems = orderItems.map((item: any) => ({
          price_data: {
            currency: 'usd',
            product_data: { name: item.name },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        }));

        const session = await this.stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: lineItems,
          mode: 'payment',
          success_url: `${process.env.FRONTEND_URL}/checkout/success?orderId=${order.id}`,
          cancel_url: `${process.env.FRONTEND_URL}/cart`,
          metadata: { orderId: order.id, userId },
        });
        return { url: session.url, orderId: order.id };
      }

      if (paymentMethod === 'PAYPAL') {
        const paypalOrder = await this.paymentsService.createPayPalOrder(order.id, finalTotal);
        return { url: paypalOrder.url, orderId: order.id };
      }

      // Default: COD
      if (discountCodeId) {
        await this.prisma.discountCode.update({
          where: { id: discountCodeId },
          data: { usedCount: { increment: 1 } },
        });
      }

      await this.prisma.order.update({
        where: { id: order.id },
        data: { status: 'PROCESSING' },
      });

      await this.prisma.cartItem.deleteMany({ where: { userId } });
      return { orderId: order.id };

    } catch (error) {
      console.error('Create Order Error:', error);
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(`Failed to create order: ${error.message}`);
    }
  }

  async findAll() {
    return this.prisma.order.findMany({
      include: { items: { include: { product: true } }, user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { 
        items: { include: { product: true } },
        discountCode: true
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(orderId: string) {
    return this.prisma.order.findUnique({
      where: { id: orderId },
      include: { 
        items: { include: { product: true } },
        user: true,
        discountCode: true
      },
    });
  }

  async findByIdForUser(orderId: string, user: User) {
    const order = await this.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');
    if (user.role !== Role.ADMIN && order.userId !== user.id) {
      throw new ForbiddenException('You cannot access this order');
    }
    return order;
  }

  async updateStatus(orderId: string, status: string, tracking?: { number?: string; url?: string }) {
    const data: any = { status: status as any };
    if (tracking?.number) data.trackingNumber = tracking.number;
    if (tracking?.url) data.trackingUrl = tracking.url;
    return this.prisma.order.update({ where: { id: orderId }, data });
  }
}
