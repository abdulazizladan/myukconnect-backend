import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';

export class AddToCartDto {
  @ApiProperty({ example: 'uuid-of-product', description: 'Product ID to add to cart' })
  @IsString()
  @IsNotEmpty()
  product_id: string;

  @ApiProperty({ example: 2, description: 'Quantity to add' })
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  quantity: number;
}
