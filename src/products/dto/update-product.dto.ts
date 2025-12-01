import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, Max, IsBoolean, IsUrl } from 'class-validator';

export class UpdateProductDto {
  @ApiProperty({ example: 'iPhone 15 Pro Max', description: 'Product name', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 'Updated product description', description: 'Product description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 1099.99, description: 'Product price in GBP', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiProperty({ example: 15, description: 'Discount percentage (0-100)', required: false })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  discount_percentage?: number;

  @ApiProperty({ example: 75, description: 'Stock quantity available', required: false })
  @IsNumber()
  @Min(0)
  @IsOptional()
  stock_quantity?: number;

  @ApiProperty({ example: 'IPH15PROMAX-BLK-256', description: 'Stock Keeping Unit code', required: false })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiProperty({ example: 'Smartphones', description: 'Product category', required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ example: 'https://example.com/new-image.jpg', description: 'Product image URL', required: false })
  @IsUrl()
  @IsOptional()
  image_url?: string;

  @ApiProperty({ example: false, description: 'Product availability status', required: false })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
