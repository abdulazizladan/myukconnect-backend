import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Order } from './order.entity';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  user_id: string;

  @Column({ name: 'address_line1' })
  address_line1: string;

  @Column({ name: 'address_line2', nullable: true })
  address_line2: string;

  @Column()
  city: string;

  @Column({ nullable: true })
  county: string;

  @Column()
  postcode: string;

  @Column({ default: 'United Kingdom' })
  country: string;

  @Column({ name: 'is_default', default: false })
  is_default: boolean;

  @ManyToOne(() => User, user => user.addresses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Order, order => order.shippingAddress)
  orders: Order[];

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}

