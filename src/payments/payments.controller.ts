import { Controller, Post, Body, UseGuards, Headers, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiExcludeEndpoint } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { Request } from 'express';
import type { RawBodyRequest } from '@nestjs/common';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-payment-intent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a Stripe payment intent for an order' })
  @ApiResponse({ status: 201, description: 'Payment intent created successfully' })
  @ApiResponse({ status: 400, description: 'Order already paid or cancelled' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  createPaymentIntent(
    @CurrentUser() user: any,
    @Body() createPaymentIntentDto: CreatePaymentIntentDto,
  ) {
    return this.paymentsService.createPaymentIntent(user.id, createPaymentIntentDto.order_id);
  }

  @Post('webhook')
  @ApiExcludeEndpoint()
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    const payload = request.rawBody as Buffer;
    return this.paymentsService.handleWebhook(signature, payload);
  }
}
