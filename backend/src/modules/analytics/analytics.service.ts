import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async dashboard() {
    // Current 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const [revenue, codRevenue, orders, products, users, recentOrders, topProducts] = await Promise.all([
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: { 
          status: { in: ['PROCESSING', 'SHIPPED', 'DELIVERED'] },
          paymentMethod: { not: 'COD' }
        },
      }),
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: { 
          paymentMethod: 'COD',
          status: { not: 'CANCELLED' }
        },
      }),
      this.prisma.order.count(),
      this.prisma.product.count(),
      this.prisma.user.count({ where: { role: 'USER' } }),
      this.prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { firstName: true, lastName: true, email: true } } },
      }),
      this.prisma.orderItem.groupBy({
        by: ['productId'],
        _count: { productId: true },
        orderBy: { _count: { productId: 'desc' } },
        take: 5,
      }),
    ]);

    return {
      totalRevenue: revenue?._sum?.total || 0,
      totalCodRevenue: codRevenue?._sum?.total || 0,
      totalOrders: orders,
      totalProducts: products,
      totalUsers: users,
      recentOrders,
      topProducts,
    };
  }

  async getDashboardMetrics() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const [
      currentOrders, previousOrders,
      currentRevenue, previousRevenue,
      currentUsers, previousUsers,
      totalProducts, currentCodRevenue
    ] = await Promise.all([
      // Orders
      this.prisma.order.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      this.prisma.order.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
      // Revenue (Online)
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: { 
          createdAt: { gte: thirtyDaysAgo }, 
          status: { in: ['PROCESSING', 'SHIPPED', 'DELIVERED'] },
          paymentMethod: { not: 'COD' }
        },
      }),
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: { 
          createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo }, 
          status: { in: ['PROCESSING', 'SHIPPED', 'DELIVERED'] },
          paymentMethod: { not: 'COD' }
        },
      }),
      // Users
      this.prisma.user.count({ where: { role: 'USER', createdAt: { gte: thirtyDaysAgo } } }),
      this.prisma.user.count({ where: { role: 'USER', createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
      // Others
      this.prisma.product.count(),
      this.prisma.order.aggregate({
        _sum: { total: true },
        where: { paymentMethod: 'COD', status: { not: 'CANCELLED' } }
      }),
    ]);

    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return parseFloat((((current - previous) / previous) * 100).toFixed(1));
    };

    return {
      totalOrders: await this.prisma.order.count(),
      ordersTrend: calculateTrend(currentOrders, previousOrders),
      
      totalRevenue: (await this.prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { in: ['PROCESSING', 'SHIPPED', 'DELIVERED'] }, paymentMethod: { not: 'COD' } }
      }))?._sum?.total || 0,
      revenueTrend: calculateTrend(currentRevenue?._sum?.total || 0, previousRevenue?._sum?.total || 0),

      totalUsers: await this.prisma.user.count({ where: { role: 'USER' } }),
      usersTrend: calculateTrend(currentUsers, previousUsers),

      totalCodRevenue: currentCodRevenue?._sum?.total || 0,
      totalProducts,
    };
  }

  async getOrderStats(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [orders, newUsers] = await Promise.all([
      this.prisma.order.findMany({
        where: {
          createdAt: { gte: startDate },
          status: { not: 'CANCELLED' },
        },
        select: {
          createdAt: true,
          total: true,
        },
      }),
      this.prisma.user.findMany({
        where: {
          createdAt: { gte: startDate },
          role: 'USER',
        },
        select: {
          createdAt: true,
        },
      }),
    ]);

    const stats: Record<string, { revenue: number; orders: number; customers: number }> = {};

    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      stats[dateStr] = { revenue: 0, orders: 0, customers: 0 };
    }

    orders.forEach((order) => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (stats[date]) {
        stats[date].revenue += order.total;
        stats[date].orders += 1;
      }
    });

    newUsers.forEach((user) => {
      const date = user.createdAt.toISOString().split('T')[0];
      if (stats[date]) {
        stats[date].customers += 1;
      }
    });

    return Object.entries(stats)
      .map(([date, data]) => ({
        date,
        ...data,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async getProductStats() {
    const products = await this.prisma.product.findMany({
      select: {
        id: true,
        name: true,
        rating: true,
        reviewCount: true,
        stock: true,
        _count: {
          select: {
            orderItems: true,
            reviews: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      rating: product.rating || 0,
      reviews: product.reviewCount,
      sales: product._count.orderItems,
      stock: product.stock,
    }));
  }

  async getTopSellingProducts(limit: number = 10) {
    const products = await this.prisma.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        _count: {
          select: { orderItems: true },
        },
      },
      orderBy: {
        orderItems: { _count: 'desc' },
      },
      take: limit,
    });

    return products.map((product) => ({
      ...product,
      sales: product._count.orderItems,
    }));
  }

  async getCustomerStats() {
    const [newCustomers, returningCustomers, totalCustomers] = await Promise.all([
      this.prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30)),
          },
        },
      }),
      this.prisma.user.count({
        where: {
          orders: {
            some: {
              createdAt: {
                lt: new Date(new Date().setDate(new Date().getDate() - 30)),
              },
            },
          },
        },
      }),
      this.prisma.user.count(),
    ]);

    return {
      newCustomers,
      returningCustomers,
      totalCustomers,
    };
  }

  async getOrderStatusBreakdown() {
    const statuses = await this.prisma.order.groupBy({
      by: ['status'],
      _count: true,
    });

    return statuses.map((status) => ({
      status: status.status,
      count: status._count,
    }));
  }

  async getRevenueByCategory() {
    const categories = await this.prisma.category.findMany({
      select: {
        name: true,
        products: {
          select: {
            orderItems: {
              where: { 
                order: { status: { in: ['PROCESSING', 'SHIPPED', 'DELIVERED'] } } 
              },
              select: { price: true },
            },
          },
        },
      },
    });

    return categories.map((category) => {
      const revenue = category.products.reduce((sum, product) => {
        return (
          sum +
          product.orderItems.reduce((productSum, item) => productSum + item.price, 0)
        );
      }, 0);

      return {
        category: category.name,
        revenue,
      };
    });
  }

  async getAverageOrderValue() {
    const result = await this.prisma.order.aggregate({
      _avg: { total: true },
      _count: true,
      where: { status: { in: ['PROCESSING', 'SHIPPED', 'DELIVERED'] } },
    });

    return {
      averageOrderValue: result._avg.total || 0,
      totalOrders: result._count,
    };
  }

  async getRecentOrders(limit: number = 5) {
    const orders = await this.prisma.order.findMany({
      select: {
        id: true,
        createdAt: true,
        total: true,
        status: true,
        paymentMethod: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return orders;
  }
}