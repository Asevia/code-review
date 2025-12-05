import { IOrderRepository } from '../../domain/repositories/IOrderRepository.js';
import {
  PaymentMethod,
  PaymentMethodProps,
} from '../../domain/value-objects/PaymentMethod.js';
import { PricingService, OrderTotals } from '../../domain/services/PricingService.js';

export interface UpdatePaymentMethodInput {
  orderId: string;
  paymentMethod: PaymentMethodProps;
}

export class UpdatePaymentMethodUseCase {
  constructor(
    private orderRepository: IOrderRepository,
    private pricingService: PricingService
  ) {}

  async execute(input: UpdatePaymentMethodInput): Promise<OrderTotals> {
    const order = await this.orderRepository.findById(input.orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const paymentMethod = PaymentMethod.create(input.paymentMethod);
    order.updatePaymentMethod(paymentMethod);

    await this.orderRepository.update(order);

    return this.pricingService.calculateTotal(order);
  }
}
