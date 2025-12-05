import { IOrderRepository } from '../../domain/repositories/IOrderRepository.js';

export interface ProcessPaymentOutput {
  success: boolean;
  orderId: string;
  message: string;
}

export class ProcessPaymentUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  async execute(orderId: string): Promise<ProcessPaymentOutput> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.isExpired()) {
      throw new Error('Order reservation has expired');
    }

    if (!order.paymentMethod) {
      throw new Error('Payment method not selected');
    }

    // Mark order as paid (stock was already reserved during checkout initiation)
    order.completePurchase();
    await this.orderRepository.update(order);

    return {
      success: true,
      orderId: order.orderId,
      message: 'Payment processed successfully',
    };
  }
}
