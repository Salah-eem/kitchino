import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: string) {
    return this.prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });
  }

  async addItem(userId: string, productId: string, quantity: number = 1) {
    const existing = await this.prisma.cartItem.findFirst({
      where: { userId, productId },
    });
    if (existing) {
      return this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    }
    return this.prisma.cartItem.create({
      data: { userId, productId, quantity },
    });
  }

  async removeItem(userId: string, productId: string) {
    await this.prisma.cartItem.deleteMany({ where: { userId, productId } });
  }

  async updateQuantity(userId: string, productId: string, quantity: number) {
    return this.prisma.cartItem.update({
      where: { id: (await this.prisma.cartItem.findFirst({ where: { userId, productId } }))?.id! },
      data: { quantity },
    });
  }

  async clearCart(userId: string) {
    await this.prisma.cartItem.deleteMany({ where: { userId } });
  }
}