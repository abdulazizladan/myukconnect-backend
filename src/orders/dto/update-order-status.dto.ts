import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn } from 'class-validator';

export class UpdateOrderStatusDto {
  @ApiProperty({ example: 'shipped', description: 'Order status', required: false })
  @IsString()
  @IsIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
  @IsOptional()
  status?: string;

  @ApiProperty({ example: 'succeeded', description: 'Payment status', required: false })
  @IsString()
  @IsIn(['pending', 'processing', 'succeeded', 'failed', 'refunded'])
  @IsOptional()
  payment_status?: string;

  @ApiProperty({ example: 'TRACK123456789', description: 'Tracking number', required: false })
  @IsString()
  @IsOptional()
  tracking_number?: string;
}
