import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Address } from '../entities/address.entity';
import { Cart } from '../entities/cart.entity';
import { CartItem } from '../entities/cart-item.entity';
import { Product } from '../entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, Address, Cart, CartItem, Product])],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
