export enum OrderStatus {
  DRAFT = 'DRAFT',
  RESERVED = 'RESERVED',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  PAID = 'PAID',
  EXPIRED = 'EXPIRED',
}

export class OrderStatusValidator {
  private static readonly VALID_TRANSITIONS: Record<
    OrderStatus,
    OrderStatus[]
  > = {
    [OrderStatus.DRAFT]: [OrderStatus.RESERVED],
    [OrderStatus.RESERVED]: [
      OrderStatus.PAYMENT_PENDING,
      OrderStatus.PAID,
      OrderStatus.EXPIRED,
    ],
    [OrderStatus.PAYMENT_PENDING]: [OrderStatus.PAID, OrderStatus.EXPIRED],
    [OrderStatus.PAID]: [],
    [OrderStatus.EXPIRED]: [],
  };

  static canTransition(from: OrderStatus, to: OrderStatus): boolean {
    return OrderStatusValidator.VALID_TRANSITIONS[from].includes(to);
  }

  static validateTransition(from: OrderStatus, to: OrderStatus): void {
    if (!this.canTransition(from, to)) {
      throw new Error(
        `Invalid status transition from ${from} to ${to}`
      );
    }
  }
}
