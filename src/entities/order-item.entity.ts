import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';
import { Product } from './product.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'order_id' })
  order_id: string;

  @Column({ name: 'product_id' })
  product_id: string;

  @Column({ name: 'product_name' })
  product_name: string;

  @Column()
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ name: 'discount_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  discount_percentage: number;

  @Column('decimal', { precision: 10, scale: 2 })
  subtotal: number;

  @ManyToOne(() => Order, order => order.orderItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Product, product => product.orderItems)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}

