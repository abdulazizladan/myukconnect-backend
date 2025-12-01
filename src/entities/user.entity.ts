import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne } from 'typeorm';
import { Cart } from './cart.entity';
import { Order } from './order.entity';
import { Address } from './address.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  password_hash: string;

  @Column({ name: 'first_name' })
  first_name: string;

  @Column({ name: 'last_name' })
  last_name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: 'customer' })
  role: string;

  @Column({ name: 'is_active', default: true })
  is_active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @OneToOne(() => Cart, cart => cart.user)
  cart: Cart;

  @OneToMany(() => Order, order => order.user)
  orders: Order[];

  @OneToMany(() => Address, address => address.user)
  addresses: Address[];
}

