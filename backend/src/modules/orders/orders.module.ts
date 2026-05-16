import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PromotionsModule } from '../promotions/promotions.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
    imports: [PrismaModule, PromotionsModule, PaymentsModule],
    controllers: [OrdersController],
    providers: [OrdersService],
})
export class OrdersModule {}