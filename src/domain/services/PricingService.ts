import { Order } from '../entities/Order.js';
import { OrderItem } from '../entities/OrderItem.js';
import { Money } from '../value-objects/Money.js';
import { Coupon } from '../value-objects/Coupon.js';
import { PaymentMethod } from '../value-objects/PaymentMethod.js';
import { ShippingCalculator } from './ShippingCalculator.js';

export interface OrderTotals {
  subtotal: Money;
  discount: Money;
  shippingCost: Money;
  paymentFee: Money;
  total: Money;
}

export class PricingService {
  constructor(private shippingCalculator: ShippingCalculator) {}

  calculateSubtotal(items: OrderItem[]): Money {
    if (items.length === 0) {
      return Money.zero();
    }

    return items.reduce(
      (total, item) => total.add(item.getSubtotal()),
      Money.zero(items[0].unitPrice.currency)
    );
  }

  applyCouponDiscount(subtotal: Money, coupon: Coupon | null): Money {
    if (!coupon || !coupon.isValid()) {
      return Money.zero(subtotal.currency);
    }

    return coupon.calculateDiscount(subtotal);
  }

  applyPaymentFee(amount: Money, method: PaymentMethod | null): Money {
    if (!method || method.feePercentage === 0) {
      return Money.zero(amount.currency);
    }

    return amount.percentage(method.feePercentage);
  }

  calculateTotal(order: Order): OrderTotals {
    const subtotal = this.calculateSubtotal(order.items);
    const discount = this.applyCouponDiscount(subtotal, order.coupon);
    const subtotalAfterDiscount = subtotal.subtract(discount);

    const shippingCost = this.shippingCalculator.calculateShippingCost(
      order.address,
      subtotalAfterDiscount
    );

    const amountBeforeFee = subtotalAfterDiscount.add(shippingCost);
    const paymentFee = this.applyPaymentFee(amountBeforeFee, order.paymentMethod);

    const total = amountBeforeFee.add(paymentFee);

    return {
      subtotal,
      discount,
      shippingCost,
      paymentFee,
      total,
    };
  }
}
