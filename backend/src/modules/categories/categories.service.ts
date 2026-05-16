import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const existing = await this.prisma.category.findUnique({
      where: { slug: createCategoryDto.slug },
    });
    if (existing) throw new ConflictException('Category with this slug already exists');

    return this.prisma.category.create({ data: createCategoryDto });
  }

  async findAll() {
    return this.prisma.category.findMany({
      include: {
        _count: { select: { products: true } },
      },
    });
  }

  async findById(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          include: { _count: { select: { reviews: true } } },
        },
        _count: { select: { products: true } },
      },
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        products: { include: { _count: { select: { reviews: true } } } },
        _count: { select: { products: true } },
      },
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async update(id: string, data: Partial<CreateCategoryDto>) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');

    // Check slug uniqueness if slug is being updated
    if (data.slug && data.slug !== category.slug) {
      const existing = await this.prisma.category.findUnique({
        where: { slug: data.slug },
      });
      if (existing) throw new ConflictException('Category with this slug already exists');
    }

    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { products: { select: { id: true } } },
    });
    if (!category) throw new NotFoundException('Category not found');
    if (category.products.length > 0) {
      throw new ConflictException('Cannot delete category with products');
    }

    await this.prisma.category.delete({ where: { id } });
    return { message: 'Category deleted successfully' };
  }
}
