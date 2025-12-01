import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateAddressDto {
  @ApiProperty({ example: '456 Main Road', description: 'Primary address line', required: false })
  @IsString()
  @IsOptional()
  address_line1?: string;

  @ApiProperty({ example: 'Suite 10', description: 'Secondary address line', required: false })
  @IsString()
  @IsOptional()
  address_line2?: string;

  @ApiProperty({ example: 'Manchester', description: 'City name', required: false })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ example: 'Greater Manchester', description: 'County or region', required: false })
  @IsString()
  @IsOptional()
  county?: string;

  @ApiProperty({ example: 'M1 1AA', description: 'UK postcode', required: false })
  @IsString()
  @IsOptional()
  postcode?: string;

  @ApiProperty({ example: 'United Kingdom', description: 'Country name', required: false })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({ example: false, description: 'Set as default shipping address', required: false })
  @IsBoolean()
  @IsOptional()
  is_default?: boolean;
}
