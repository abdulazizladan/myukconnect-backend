import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Addresses')
@Controller('addresses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new shipping address' })
  @ApiResponse({ status: 201, description: 'Address created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@CurrentUser() user: any, @Body() createAddressDto: CreateAddressDto) {
    return this.addressesService.create(user.id, createAddressDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user addresses' })
  @ApiResponse({ status: 200, description: 'Addresses retrieved successfully' })
  findAll(@CurrentUser() user: any) {
    return this.addressesService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single address by ID' })
  @ApiResponse({ status: 200, description: 'Address retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.addressesService.findOne(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an address' })
  @ApiResponse({ status: 200, description: 'Address updated successfully' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() updateAddressDto: UpdateAddressDto) {
    return this.addressesService.update(user.id, id, updateAddressDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an address' })
  @ApiResponse({ status: 200, description: 'Address deleted successfully' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.addressesService.remove(user.id, id);
  }

  @Patch(':id/set-default')
  @ApiOperation({ summary: 'Set address as default shipping address' })
  @ApiResponse({ status: 200, description: 'Default address set successfully' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  setDefault(@CurrentUser() user: any, @Param('id') id: string) {
    return this.addressesService.setDefault(user.id, id);
  }
}
