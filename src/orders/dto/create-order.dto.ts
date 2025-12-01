import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsIn } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ example: 'uuid-of-address', description: 'Shipping address ID' })
  @IsString()
  @IsNotEmpty()
  shipping_address_id: string;

  @ApiProperty({ example: 'standard', description: 'Delivery option: standard, express, or next-day' })
  @IsString()
  @IsIn(['standard', 'express', 'next-day'])
  @IsNotEmpty()
  delivery_option: string;

  @ApiProperty({ example: 'Please leave at the front door', description: 'Order notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
