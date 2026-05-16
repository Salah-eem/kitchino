import { Controller, Get, Post, Delete, Body, Param, UseGuards, Patch } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '@prisma/client';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  getCart(@CurrentUser() user: User) {
    return this.cartService.getCart(user.id);
  }

  @Post()
  addItem(@CurrentUser() user: User, @Body('productId') productId: string, @Body('quantity') quantity: number = 1) {
    return this.cartService.addItem(user.id, productId, quantity);
  }

  @Patch(':productId')
  updateQuantity(@CurrentUser() user: User, @Param('productId') productId: string, @Body('quantity') quantity: number) {
    return this.cartService.updateQuantity(user.id, productId, quantity);
  }

  @Delete(':productId')
  removeItem(@CurrentUser() user: User, @Param('productId') productId: string) {
    return this.cartService.removeItem(user.id, productId);
  }

  @Delete()
  clearCart(@CurrentUser() user: User) {
    return this.cartService.clearCart(user.id);
  }
}