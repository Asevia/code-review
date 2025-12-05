import { IOrderRepository } from '../../domain/repositories/IOrderRepository.js';
import { ICouponRepository } from '../../domain/repositories/ICouponRepository.js';
import { PricingService, OrderTotals } from '../../domain/services/PricingService.js';

export interface ApplyCouponInput {
  orderId: string;
  couponCode: string;
}

export class ApplyCouponUseCase {
  constructor(
    private orderRepository: IOrderRepository,
    private couponRepository: ICouponRepository,
    private pricingService: PricingService
  ) {}

  async execute(input: ApplyCouponInput): Promise<OrderTotals> {
    const order = await this.orderRepository.findById(input.orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const coupon = await this.couponRepository.findByCode(input.couponCode);
    if (!coupon) {
      throw new Error('Coupon not found');
    }

    if (!coupon.isValid()) {
      throw new Error('Coupon has expired');
    }

    order.applyCoupon(coupon);
    await this.orderRepository.update(order);

    return this.pricingService.calculateTotal(order);
  }
}
