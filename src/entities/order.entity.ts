import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Address } from './address.entity';
import { OrderItem } from './order-item.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  user_id: string;

  @Column({ name: 'order_number', unique: true })
  order_number: string;

  @Column({ name: 'shipping_address_id' })
  shipping_address_id: string;

  @Column('decimal', { precision: 10, scale: 2 })
  subtotal: number;

  @Column({ name: 'shipping_cost', type: 'decimal', precision: 10, scale: 2 })
  shipping_cost: number;

  @Column('decimal', { precision: 10, scale: 2 })
  tax: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column({ name: 'delivery_option' })
  delivery_option: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: 'pending' })
  status: string;

  @Column({ name: 'payment_status', default: 'pending' })
  payment_status: string;

  @Column({ name: 'payment_intent_id', nullable: true })
  payment_intent_id: string;

  @ManyToOne(() => User, user => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Address, address => address.orders)
  @JoinColumn({ name: 'shipping_address_id' })
  shippingAddress: Address;

  @OneToMany(() => OrderItem, orderItem => orderItem.order, { cascade: true })
  orderItems: OrderItem[];

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}

