import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDiscountDto } from './dto/create-discount.dto';

@Injectable()
export class PromotionsService {
  constructor(private prisma: PrismaService) {}

  async createDiscount(createDiscountDto: CreateDiscountDto) {
    // Check if code already exists
    const existing = await this.prisma.discountCode.findUnique({
      where: { code: createDiscountDto.code },
    });
    if (existing) throw new ConflictException('Discount code already exists');

    return this.prisma.discountCode.create({
      data: {
        ...createDiscountDto,
        code: createDiscountDto.code.toUpperCase(),
        expiresAt: createDiscountDto.expiresAt ? new Date(createDiscountDto.expiresAt) : undefined,
      },
    });
  }

  async findAll() {
    return this.prisma.discountCode.findMany({
      orderBy: { expiresAt: 'desc' },
    });
  }

  async findById(id: string) {
    const discount = await this.prisma.discountCode.findUnique({ where: { id } });
    if (!discount) throw new NotFoundException('Discount code not found');
    return discount;
  }

  async findByCode(code: string) {
    const discount = await this.prisma.discountCode.findUnique({
      where: { code: code.toUpperCase() },
    });
    if (!discount) throw new NotFoundException('Discount code not found');
    return discount;
  }

  async validateDiscount(code: string, orderAmount: number) {
    const discount = await this.findByCode(code);

    // Check if discount is active
    if (!discount.isActive) throw new BadRequestException('Discount code is inactive');

    // Check expiration
    if (discount.expiresAt && new Date() > discount.expiresAt) {
      throw new BadRequestException('Discount code has expired');
    }

    // Check max uses
    if (discount.maxUses && discount.usedCount >= discount.maxUses) {
      throw new BadRequestException('Discount code has reached maximum uses');
    }

    // Check minimum order amount
    if (discount.minOrderAmount && orderAmount < discount.minOrderAmount) {
      throw new BadRequestException(
        `Minimum order amount of $${discount.minOrderAmount} required`,
      );
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discount.type === 'PERCENTAGE') {
      discountAmount = (orderAmount * discount.value) / 100;
    } else {
      discountAmount = discount.value;
    }

    return {
      ...discount,
      discountAmount,
    };
  }

  async update(id: string, data: Partial<CreateDiscountDto>) {
    const discount = await this.findById(id);

    // Check code uniqueness if code is being updated
    if (data.code && data.code !== discount.code) {
      const existing = await this.prisma.discountCode.findUnique({
        where: { code: data.code.toUpperCase() },
      });
      if (existing) throw new ConflictException('Discount code already exists');
    }

    return this.prisma.discountCode.update({
      where: { id },
      data: {
        ...data,
        code: data.code ? data.code.toUpperCase() : undefined,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      },
    });
  }

  async delete(id: string) {
    const discount = await this.findById(id);
    await this.prisma.discountCode.delete({ where: { id } });
    return { message: 'Discount code deleted successfully' };
  }

  async deactivate(id: string) {
    const discount = await this.findById(id);
    return this.prisma.discountCode.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async activate(id: string) {
    const discount = await this.findById(id);
    return this.prisma.discountCode.update({
      where: { id },
      data: { isActive: true },
    });
  }
}
