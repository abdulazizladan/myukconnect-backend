import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Cart } from './cart.entity';
import { Product } from './product.entity';

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'cart_id' })
  cart_id: string;

  @Column({ name: 'product_id' })
  product_id: string;

  @Column()
  quantity: number;

  @Column({ name: 'price_at_addition', type: 'decimal', precision: 10, scale: 2 })
  price_at_addition: number;

  @ManyToOne(() => Cart, cart => cart.cartItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;

  @ManyToOne(() => Product, product => product.cartItems)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}

