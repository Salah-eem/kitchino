import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createReviewDto: CreateReviewDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: createReviewDto.productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    // Check if user already reviewed this product
    const existingReview = await this.prisma.review.findFirst({
      where: { userId, productId: createReviewDto.productId },
    });
    if (existingReview) throw new BadRequestException('You already reviewed this product');

    // Check if user bought this product
    const order = await this.prisma.order.findFirst({
      where: {
        userId,
        items: { some: { productId: createReviewDto.productId } },
      },
    });
    if (!order) throw new BadRequestException('You must purchase this product to review it');

    const review = await this.prisma.review.create({
      data: {
        userId,
        productId: createReviewDto.productId,
        rating: createReviewDto.rating,
        comment: createReviewDto.comment,
      },
      include: { user: { select: { firstName: true, lastName: true, id: true } } },
    });

    // Update product rating
    const allReviews = await this.prisma.review.findMany({
      where: { productId: createReviewDto.productId },
    });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await this.prisma.product.update({
      where: { id: createReviewDto.productId },
      data: { rating: avgRating, reviewCount: allReviews.length },
    });

    return review;
  }

  async findAll(page = 1, limit = 10) {
    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        include: { 
          user: { select: { firstName: true, lastName: true, id: true } },
          product: { select: { id: true, name: true, slug: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: +limit,
      }),
      this.prisma.review.count(),
    ]);
    return { items: reviews, total, page: +page, limit: +limit };
  }

  async findByProduct(productId: string, page = 1, limit = 10) {
    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { productId },
        include: { user: { select: { firstName: true, lastName: true, id: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: +limit,
      }),
      this.prisma.review.count({ where: { productId } }),
    ]);
    return { items: reviews, total, page: +page, limit: +limit };
  }

  async findById(id: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: { user: { select: { firstName: true, lastName: true, id: true } }, product: true },
    });
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async update(id: string, userId: string, data: Partial<CreateReviewDto>) {
    const review = await this.findById(id);
    if (review.userId !== userId) throw new BadRequestException('You can only edit your own reviews');

    return this.prisma.review.update({
      where: { id },
      data,
      include: { user: { select: { firstName: true, lastName: true, id: true } } },
    });
  }

  async delete(id: string, userId: string) {
    const review = await this.findById(id);
    if (review.userId !== userId) throw new BadRequestException('You can only delete your own reviews');

    await this.prisma.review.delete({ where: { id } });

    // Update product rating
    const allReviews = await this.prisma.review.findMany({
      where: { productId: review.productId },
    });
    if (allReviews.length === 0) {
      await this.prisma.product.update({
        where: { id: review.productId },
        data: { rating: 0, reviewCount: 0 },
      });
    } else {
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await this.prisma.product.update({
        where: { id: review.productId },
        data: { rating: avgRating, reviewCount: allReviews.length },
      });
    }

    return { message: 'Review deleted successfully' };
  }

  async deleteAdmin(id: string) {
    const review = await this.findById(id);
    await this.prisma.review.delete({ where: { id } });

    // Update product rating
    const allReviews = await this.prisma.review.findMany({
      where: { productId: review.productId },
    });
    if (allReviews.length === 0) {
      await this.prisma.product.update({
        where: { id: review.productId },
        data: { rating: 0, reviewCount: 0 },
      });
    } else {
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await this.prisma.product.update({
        where: { id: review.productId },
        data: { rating: avgRating, reviewCount: allReviews.length },
      });
    }

    return { message: 'Review deleted by admin' };
  }
}
