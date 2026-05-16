import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async getWishlist(userId: string) {
    return this.prisma.wishlistItem.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { id: 'desc' },
    });
  }

  async addItem(userId: string, productId: string) {
    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    // Check if already in wishlist
    const existing = await this.prisma.wishlistItem.findFirst({
      where: { userId, productId },
    });
    if (existing) return existing;

    return this.prisma.wishlistItem.create({
      data: { userId, productId },
      include: { product: true },
    });
  }

  async removeItem(userId: string, productId: string) {
    const item = await this.prisma.wishlistItem.findFirst({
      where: { userId, productId },
    });
    if (!item) throw new NotFoundException('Item not found in wishlist');

    await this.prisma.wishlistItem.delete({ where: { id: item.id } });
    return { message: 'Item removed from wishlist' };
  }

  async isInWishlist(userId: string, productId: string) {
    const item = await this.prisma.wishlistItem.findFirst({
      where: { userId, productId },
    });
    return !!item;
  }

  async clearWishlist(userId: string) {
    await this.prisma.wishlistItem.deleteMany({ where: { userId } });
    return { message: 'Wishlist cleared' };
  }

  async moveToCart(userId: string, productId: string) {
    const wishlistItem = await this.prisma.wishlistItem.findFirst({
      where: { userId, productId },
    });
    if (!wishlistItem) throw new NotFoundException('Item not found in wishlist');

    // Add to cart
    const cartItem = await this.prisma.cartItem.create({
      data: { userId, productId, quantity: 1 },
    });

    // Remove from wishlist
    await this.prisma.wishlistItem.delete({ where: { id: wishlistItem.id } });

    return cartItem;
  }
}
