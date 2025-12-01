import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PaymentsModule } from './payments/payments.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { CartModule } from './cart/cart.module';
import { AuthModule } from './auth/auth.module';
import { AddressesModule } from './addresses/addresses.module';
import { User, Product, Cart, CartItem, Address, Order, OrderItem } from './entities';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'database.sqlite',
      entities: [User, Product, Cart, CartItem, Address, Order, OrderItem],
      synchronize: true, // Set to false in production
      logging: false,
    }),
    PaymentsModule, 
    ProductsModule, 
    OrdersModule, 
    CartModule, 
    AuthModule, 
    AddressesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
