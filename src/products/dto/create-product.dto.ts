import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, Min, Max, IsBoolean, IsUrl } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'iPhone 15 Pro', description: 'Product name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Latest Apple smartphone with A17 Pro chip', description: 'Product description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 999.99, description: 'Product price in GBP' })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  price: number;

  @ApiProperty({ example: 10, description: 'Discount percentage (0-100)', required: false })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  discount_percentage?: number;

  @ApiProperty({ example: 50, description: 'Stock quantity available' })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  stock_quantity: number;

  @ApiProperty({ example: 'IPH15PRO-BLK-128', description: 'Stock Keeping Unit code', required: false })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiProperty({ example: 'Electronics', description: 'Product category', required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ example: 'https://example.com/image.jpg', description: 'Product image URL', required: false })
  @IsUrl()
  @IsOptional()
  image_url?: string;

  @ApiProperty({ example: true, description: 'Product availability status', required: false })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
