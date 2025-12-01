import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order from cart items' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Cart empty or insufficient stock' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  createOrder(@CurrentUser() user: any, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrder(user.id, createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders (customers see their own, admins see all)' })
  @ApiResponse({ status: 200, description: 'Orders retrieved successfully' })
  findAll(@CurrentUser() user: any) {
    const isAdmin = user.role === 'admin';
    return this.ordersService.findAll(isAdmin ? undefined : user.id, isAdmin);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single order by ID' })
  @ApiResponse({ status: 200, description: 'Order retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    const userId = user.role === 'admin' ? undefined : user.id;
    return this.ordersService.findOne(id, userId);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Update order status and tracking (Admin only)' })
  @ApiResponse({ status: 200, description: 'Order status updated successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  updateOrderStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateOrderStatusDto) {
    return this.ordersService.updateOrderStatus(id, updateStatusDto);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel an order (only pending/processing orders)' })
  @ApiResponse({ status: 200, description: 'Order cancelled successfully' })
  @ApiResponse({ status: 400, description: 'Order cannot be cancelled at this stage' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  cancelOrder(@CurrentUser() user: any, @Param('id') id: string) {
    return this.ordersService.cancelOrder(id, user.id);
  }
}
