import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role, User } from '@prisma/client';
import { Roles } from '@app/common/decorators/roles.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: User, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(user.id, createReviewDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.reviewsService.findAll(page, limit);
  }

  @Get('product/:productId')
  findByProduct(@Param('productId') productId: string, @Query('page') page = 1, @Query('limit') limit = 10) {
    return this.reviewsService.findByProduct(productId, page, limit);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.reviewsService.findById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @CurrentUser() user: User, @Body() data: Partial<CreateReviewDto>) {
    return this.reviewsService.update(id, user.id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  delete(@Param('id') id: string, @CurrentUser() user: User) {
    return this.reviewsService.delete(id, user.id);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.ADMIN)
  deleteAdmin(@Param('id') id: string) {
    return this.reviewsService.deleteAdmin(id);
  }
}
