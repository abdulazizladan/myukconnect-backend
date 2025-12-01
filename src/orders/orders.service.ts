import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Address } from '../entities/address.entity';
import { Cart } from '../entities/cart.entity';
import { CartItem } from '../entities/cart-item.entity';
import { Product } from '../entities/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private dataSource: DataSource,
  ) {}

  private calculateShippingCost(deliveryOption: string): number {
    const shippingCosts = {
      'standard': 4.99,
      'express': 9.99,
      'next-day': 14.99,
    };
    return shippingCosts[deliveryOption] || 4.99;
  }

  async createOrder(userId: string, createOrderDto: CreateOrderDto) {
    const { shipping_address_id, delivery_option, notes } = createOrderDto;

    const address = await this.addressRepository.findOne({
      where: { id: shipping_address_id, user_id: userId },
    });

    if (!address) {
      throw new NotFoundException('Shipping address not found');
    }

    const cart = await this.cartRepository.findOne({
      where: { user_id: userId },
    });

    if (!cart) {
      throw new BadRequestException('Cart not found');
    }

    const cartItems = await this.cartItemRepository.find({
      where: { cart_id: cart.id },
      relations: ['product'],
    });

    if (!cartItems || cartItems.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    for (const item of cartItems) {
      if (!item.product.is_active) {
        throw new BadRequestException(`Product ${item.product.name} is no longer available`);
      }
      if (item.product.stock_quantity < item.quantity) {
        throw new BadRequestException(`Insufficient stock for ${item.product.name}`);
      }
    }

    const subtotal = cartItems.reduce((sum, item) => {
      const price = item.product.price;
      const discount = item.product.discount_percentage || 0;
      const discountedPrice = price * (1 - discount / 100);
      return sum + (discountedPrice * item.quantity);
    }, 0);

    const shipping_cost = this.calculateShippingCost(delivery_option);
    const tax = subtotal * 0.2;
    const total = subtotal + shipping_cost + tax;

    const order_number = `ORD-${Date.now()}`;

    // Use transaction to ensure data consistency
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = this.orderRepository.create({
        user_id: userId,
        order_number,
        shipping_address_id,
        subtotal: parseFloat(subtotal.toFixed(2)),
        shipping_cost: parseFloat(shipping_cost.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        delivery_option,
        notes,
        status: 'pending',
        payment_status: 'pending',
      });

      const savedOrder = await queryRunner.manager.save(Order, order);

      const orderItems = cartItems.map(item => ({
        order_id: savedOrder.id,
        product_id: item.product_id,
        product_name: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
        discount_percentage: item.product.discount_percentage || 0,
        subtotal: parseFloat((item.product.price * item.quantity).toFixed(2)),
      }));

      await queryRunner.manager.save(OrderItem, orderItems);

      // Update product stock
      for (const item of cartItems) {
        await queryRunner.manager.update(
          Product,
          { id: item.product_id },
          { stock_quantity: item.product.stock_quantity - item.quantity },
        );
      }

      // Clear cart items
      await queryRunner.manager.delete(CartItem, { cart_id: cart.id });

      await queryRunner.commitTransaction();

      return this.findOne(savedOrder.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException('Failed to create order');
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(userId?: string, isAdmin = false) {
    const where: any = {};
    if (!isAdmin && userId) {
      where.user_id = userId;
    }

    return await this.orderRepository.find({
      where,
      relations: ['shippingAddress', 'orderItems'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(orderId: string, userId?: string) {
    const where: any = { id: orderId };
    if (userId) {
      where.user_id = userId;
    }

    const order = await this.orderRepository.findOne({
      where,
      relations: ['shippingAddress', 'orderItems', 'orderItems.product'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateOrderStatus(orderId: string, updateStatusDto: UpdateOrderStatusDto) {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });

    if (!order) {
      throw new NotFoundException('Order not found or failed to update');
    }

    Object.assign(order, updateStatusDto);
    return await this.orderRepository.save(order);
  }

  async cancelOrder(orderId: string, userId: string) {
    const order = await this.findOne(orderId, userId);

    if (order.status !== 'pending' && order.status !== 'processing') {
      throw new BadRequestException('Order cannot be cancelled at this stage');
    }

    order.status = 'cancelled';
    const cancelledOrder = await this.orderRepository.save(order);

    const orderItems = await this.orderItemRepository.find({
      where: { order_id: orderId },
    });

    for (const item of orderItems) {
      const product = await this.productRepository.findOne({
        where: { id: item.product_id },
      });

      if (product) {
        product.stock_quantity += item.quantity;
        await this.productRepository.save(product);
      }
    }

    return cancelledOrder;
  }
}
