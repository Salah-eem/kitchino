import { Controller, Get, Post, UseGuards, Query, Param, Body } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User, Role } from '@prisma/client';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get('history')
  @UseGuards(JwtAuthGuard)
  getHistory(@CurrentUser() user: User) {
    return this.ordersService.findAllByUser(user.id);
  }

  // Admin route to get all orders
  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getAllOrders() {
    return this.ordersService.findAll();
  }
  
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getOrder(@Param('id') id: string, @CurrentUser() user: User) {
    return this.ordersService.findByIdForUser(id, user);
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  checkout(@CurrentUser() user: User, @Query('discountCode') discountCode?: string) {
    return this.ordersService.createCheckoutSession(user.id, discountCode);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: User, @Body() data: any) {
    return this.ordersService.create(user.id, data);
  }

  // Admin route to update order status
  @Post(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; trackingNumber?: string; trackingUrl?: string },
  ) {
    return this.ordersService.updateStatus(id, body.status, { number: body.trackingNumber, url: body.trackingUrl });
  }
}
