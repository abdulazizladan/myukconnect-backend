import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePaymentIntentDto {
  @ApiProperty({ example: 'uuid-of-order', description: 'Order ID to create payment for' })
  @IsString()
  @IsNotEmpty()
  order_id: string;
}
