import { Order } from '../../domain/entities/Order.js';
import { OrderTotals } from '../../domain/services/PricingService.js';

export interface OrderDTO {
  orderId: string;
  customerId: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: {
      amount: number;
      currency: string;
    };
    subtotal: {
      amount: number;
      currency: string;
    };
  }>;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    phone: string;
  };
  paymentMethod: {
    type: string;
    feePercentage: number;
    installments?: number;
  } | null;
  coupon: {
    code: string;
    type: string;
    value: number;
  } | null;
  status: string;
  totals: {
    subtotal: {
      amount: number;
      currency: string;
    };
    discount: {
      amount: number;
      currency: string;
    };
    shippingCost: {
      amount: number;
      currency: string;
    };
    paymentFee: {
      amount: number;
      currency: string;
    };
    total: {
      amount: number;
      currency: string;
    };
  };
  reservationExpiresAt: string | null;
  createdAt: string;
}

export class OrderDTOMapper {
  static toDTO(order: Order, totals: OrderTotals): OrderDTO {
    return {
      orderId: order.orderId,
      customerId: order.customerId,
      items: order.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toJSON(),
        subtotal: item.getSubtotal().toJSON(),
      })),
      address: order.address.toJSON(),
      paymentMethod: order.paymentMethod?.toJSON() || null,
      coupon: order.coupon
        ? {
            code: order.coupon.code,
            type: order.coupon.type,
            value: order.coupon.value,
          }
        : null,
      status: order.status,
      totals: {
        subtotal: totals.subtotal.toJSON(),
        discount: totals.discount.toJSON(),
        shippingCost: totals.shippingCost.toJSON(),
        paymentFee: totals.paymentFee.toJSON(),
        total: totals.total.toJSON(),
      },
      reservationExpiresAt: order.reservationExpiresAt?.toISOString() || null,
      createdAt: order.createdAt.toISOString(),
    };
  }
}
