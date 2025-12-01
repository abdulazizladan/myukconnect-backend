import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateAddressDto {
  @ApiProperty({ example: '123 High Street', description: 'Primary address line' })
  @IsString()
  @IsNotEmpty()
  address_line1: string;

  @ApiProperty({ example: 'Apartment 4B', description: 'Secondary address line', required: false })
  @IsString()
  @IsOptional()
  address_line2?: string;

  @ApiProperty({ example: 'London', description: 'City name' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Greater London', description: 'County or region', required: false })
  @IsString()
  @IsOptional()
  county?: string;

  @ApiProperty({ example: 'SW1A 1AA', description: 'UK postcode' })
  @IsString()
  @IsNotEmpty()
  postcode: string;

  @ApiProperty({ example: 'United Kingdom', description: 'Country name', required: false })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({ example: true, description: 'Set as default shipping address', required: false })
  @IsBoolean()
  @IsOptional()
  is_default?: boolean;
}
