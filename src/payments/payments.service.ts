import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { Order } from '../entities/order.entity';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      throw new Error('Stripe secret key is not configured'); 
    }

    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-11-17.clover',
    });
  }

  async createPaymentIntent(userId: string, orderId: string) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, user_id: userId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.payment_status === 'succeeded') {
      throw new BadRequestException('Order has already been paid');
    }

    if (order.status === 'cancelled') {
      throw new BadRequestException('Cannot pay for a cancelled order');
    }

    const amountInPence = Math.round(order.total * 100);

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amountInPence,
      currency: 'gbp',
      metadata: {
        order_id: orderId,
        user_id: userId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    order.payment_intent_id = paymentIntent.id;
    order.payment_status = 'processing';
    await this.orderRepository.save(order);

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

  async handleWebhook(signature: string, payload: Buffer) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new BadRequestException('Webhook secret not configured');
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      throw new BadRequestException(`Webhook signature verification failed: ${err.message}`);
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        break;
    }

    return { received: true };
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    const orderId = paymentIntent.metadata.order_id;

    if (orderId) {
      const order = await this.orderRepository.findOne({
        where: { id: orderId },
      });

      if (order) {
        order.payment_status = 'succeeded';
        order.status = 'processing';
        await this.orderRepository.save(order);
      }
    }
  }

  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
    const orderId = paymentIntent.metadata.order_id;

    if (orderId) {
      const order = await this.orderRepository.findOne({
        where: { id: orderId },
      });

      if (order) {
        order.payment_status = 'failed';
        await this.orderRepository.save(order);
      }
    }
  }

  async getPaymentIntent(paymentIntentId: string) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;
    } catch (error) {
      throw new NotFoundException('Payment intent not found');
    }
  }
}
