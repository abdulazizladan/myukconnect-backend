import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty({ example: 3, description: 'New quantity for cart item' })
  @IsNumber()
  @Min(1)
  quantity: number;
}
