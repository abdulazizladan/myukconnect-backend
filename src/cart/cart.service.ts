import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from '../entities/cart.entity';
import { CartItem } from '../entities/cart-item.entity';
import { Product } from '../entities/product.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async getOrCreateCart(userId: string) {
    let cart = await this.cartRepository.findOne({
      where: { user_id: userId },
    });

    if (!cart) {
      cart = this.cartRepository.create({ user_id: userId });
      cart = await this.cartRepository.save(cart);
    }

    return cart;
  }

  async getCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);

    const cartItems = await this.cartItemRepository.find({
      where: { cart_id: cart.id },
      relations: ['product'],
    });

    const total = cartItems.reduce((sum, item) => {
      const price = item.price_at_addition || 0;
      const quantity = item.quantity || 0;
      return sum + (price * quantity);
    }, 0);

    return {
      cart,
      items: cartItems,
      total,
      itemCount: cartItems.length,
    };
  }

  async addToCart(userId: string, addToCartDto: AddToCartDto) {
    const { product_id, quantity } = addToCartDto;

    const product = await this.productRepository.findOne({
      where: { id: product_id, is_active: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found or inactive');
    }

    if (product.stock_quantity < quantity) {
      throw new BadRequestException('Insufficient stock available');
    }

    const cart = await this.getOrCreateCart(userId);

    const existingItem = await this.cartItemRepository.findOne({
      where: { cart_id: cart.id, product_id },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      if (product.stock_quantity < newQuantity) {
        throw new BadRequestException('Insufficient stock available');
      }

      existingItem.quantity = newQuantity;
      return await this.cartItemRepository.save(existingItem);
    }

    const cartItem = this.cartItemRepository.create({
      cart_id: cart.id,
      product_id,
      quantity,
      price_at_addition: product.price,
    });

    return await this.cartItemRepository.save(cartItem);
  }

  async updateCartItem(userId: string, itemId: string, quantity: number) {
    const cart = await this.getOrCreateCart(userId);

    const cartItem = await this.cartItemRepository.findOne({
      where: { id: itemId, cart_id: cart.id },
      relations: ['product'],
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    const product = cartItem.product;

    if (product.stock_quantity < quantity) {
      throw new BadRequestException('Insufficient stock available');
    }

    cartItem.quantity = quantity;
    return await this.cartItemRepository.save(cartItem);
  }

  async removeFromCart(userId: string, itemId: string) {
    const cart = await this.getOrCreateCart(userId);

    const cartItem = await this.cartItemRepository.findOne({
      where: { id: itemId, cart_id: cart.id },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartItemRepository.remove(cartItem);
    return { message: 'Item removed from cart' };
  }

  async clearCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);

    const cartItems = await this.cartItemRepository.find({
      where: { cart_id: cart.id },
    });

    await this.cartItemRepository.remove(cartItems);
    return { message: 'Cart cleared successfully' };
  }
}
