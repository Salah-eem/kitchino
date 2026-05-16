import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('dashboard')
  getDashboard() {
    return this.analyticsService.dashboard();
  }

  @Get('metrics')
  getDashboardMetrics() {
    return this.analyticsService.getDashboardMetrics();
  }

  @Get('orders')
  getOrderStats(@Query('days') days: string = '30') {
    return this.analyticsService.getOrderStats(parseInt(days));
  }

  @Get('products')
  getProductStats() {
    return this.analyticsService.getProductStats();
  }

  @Get('top-selling')
  getTopSellingProducts(@Query('limit') limit: string = '10') {
    return this.analyticsService.getTopSellingProducts(parseInt(limit));
  }

  @Get('customers')
  getCustomerStats() {
    return this.analyticsService.getCustomerStats();
  }

  @Get('order-status')
  getOrderStatusBreakdown() {
    return this.analyticsService.getOrderStatusBreakdown();
  }

  @Get('revenue-by-category')
  getRevenueByCategory() {
    return this.analyticsService.getRevenueByCategory();
  }

  @Get('average-order-value')
  getAverageOrderValue() {
    return this.analyticsService.getAverageOrderValue();
  }

  @Get('recent-orders')
  getRecentOrders(@Query('limit') limit: string = '5') {
    return this.analyticsService.getRecentOrders(parseInt(limit));
  }
}