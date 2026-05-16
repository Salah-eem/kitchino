import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '@prisma/client';

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
  constructor(private wishlistService: WishlistService) {}

  @Get()
  getWishlist(@CurrentUser() user: User) {
    return this.wishlistService.getWishlist(user.id);
  }

  @Post('add')
  addItem(@CurrentUser() user: User, @Body('productId') productId: string) {
    return this.wishlistService.addItem(user.id, productId);
  }

  @Delete('remove/:productId')
  removeItem(@CurrentUser() user: User, @Param('productId') productId: string) {
    return this.wishlistService.removeItem(user.id, productId);
  }

  @Get('check/:productId')
  isInWishlist(@CurrentUser() user: User, @Param('productId') productId: string) {
    return this.wishlistService.isInWishlist(user.id, productId);
  }

  @Delete('clear')
  clearWishlist(@CurrentUser() user: User) {
    return this.wishlistService.clearWishlist(user.id);
  }

  @Post('move-to-cart/:productId')
  moveToCart(@CurrentUser() user: User, @Param('productId') productId: string) {
    return this.wishlistService.moveToCart(user.id, productId);
  }
}
