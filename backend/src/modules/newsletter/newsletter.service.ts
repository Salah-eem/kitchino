import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NewsletterService {
  constructor(private prisma: PrismaService) {}

  async subscribe(email: string, language: string = 'en') {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('Invalid email address');
    }

    // Check if already subscribed
    const existing = await this.prisma.newsletterSubscriber.findUnique({
      where: { email },
    });
    if (existing) {
      throw new ConflictException('Email already subscribed to newsletter');
    }

    return this.prisma.newsletterSubscriber.create({
      data: {
        email,
        language,
      },
    });
  }

  async unsubscribe(email: string) {
    const subscriber = await this.prisma.newsletterSubscriber.findUnique({
      where: { email },
    });
    if (!subscriber) {
      throw new NotFoundException('Subscriber not found');
    }

    await this.prisma.newsletterSubscriber.delete({
      where: { email },
    });

    return { message: 'Successfully unsubscribed from newsletter' };
  }

  async findAll() {
    return this.prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCount() {
    const count = await this.prisma.newsletterSubscriber.count();
    return { count };
  }

  async getCountByLanguage() {
    const subscribers = await this.prisma.newsletterSubscriber.findMany({
      select: { language: true },
    });

    const counts = subscribers.reduce((acc, sub) => {
      acc[sub.language] = (acc[sub.language] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return counts;
  }

  async isSubscribed(email: string) {
    const subscriber = await this.prisma.newsletterSubscriber.findUnique({
      where: { email },
    });
    return !!subscriber;
  }

  async delete(id: string) {
    const subscriber = await this.prisma.newsletterSubscriber.findUnique({
      where: { id },
    });
    if (!subscriber) {
      throw new NotFoundException('Subscriber not found');
    }

    await this.prisma.newsletterSubscriber.delete({
      where: { id },
    });

    return { message: 'Subscriber deleted successfully' };
  }
}
