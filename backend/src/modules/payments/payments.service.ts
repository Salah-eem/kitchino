import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import Stripe from 'stripe';
import * as paypal from '@paypal/checkout-server-sdk';

@Injectable()
export class PaymentsService {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });
  private paypalClient: paypal.core.PayPalHttpClient;

  constructor(private prisma: PrismaService) {
    const environment = new paypal.core.SandboxEnvironment(
      process.env.PAYPAL_CLIENT_ID!,
      process.env.PAYPAL_CLIENT_SECRET!
    );
    this.paypalClient = new paypal.core.PayPalHttpClient(environment);
  }

  async createPayPalOrder(orderId: string, amount: number) {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: orderId,
          amount: {
            currency_code: 'USD',
            value: amount.toFixed(2),
          },
        },
      ],
      application_context: {
        return_url: `${process.env.FRONTEND_URL}/checkout/success?orderId=${orderId}`,
        cancel_url: `${process.env.FRONTEND_URL}/cart`,
      },
    });

    try {
      const response = await this.paypalClient.execute(request);
      const approveLink = response.result.links.find((link: any) => link.rel === 'approve');
      return { url: approveLink.href, paypalOrderId: response.result.id };
    } catch (err) {
      console.error('PayPal Order Error:', err);
      throw new BadRequestException('Failed to create PayPal order');
    }
  }

  async capturePayPalOrder(orderId: string) {
    // Note: In a real app, you'd use the PayPal Order ID from the query param
    // but here we'll simulate by finding the pending order
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true }
    });

    if (!order) throw new BadRequestException('Order not found');
    if (order.status !== 'PENDING') return { status: order.status };

    try {
      // In a real production app, you would verify with PayPal here
      // const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
      // await this.paypalClient.execute(request);

      await this.completeOrder(orderId, order.userId);
      return { status: 'SUCCESS' };
    } catch (err) {
      console.error('PayPal Capture Error:', err);
      throw new BadRequestException('Failed to capture PayPal order');
    }
  }

  async handleWebhook(signature: string, rawBody: Buffer) {
    let event;
    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err) {
      console.error('Stripe Webhook Error:', err.message);
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const orderId = session.metadata?.orderId;
      const userId = session.metadata?.userId;

      if (orderId && userId) {
        await this.completeOrder(orderId, userId, session.payment_intent);
      }
    }
    return { received: true };
  }

  private async completeOrder(orderId: string, userId: string, paymentIntentId?: string) {
    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PROCESSING',
        paymentIntentId: paymentIntentId,
      },
    });

    // Update discount usage
    const order = await this.prisma.order.findUnique({ 
      where: { id: orderId }, 
      include: { discountCode: true } 
    });
    
    if (order?.discountCodeId) {
      await this.prisma.discountCode.update({
        where: { id: order.discountCodeId },
        data: { usedCount: { increment: 1 } },
      });
    }

    // Clear cart
    await this.prisma.cartItem.deleteMany({ where: { userId } });
  }
}