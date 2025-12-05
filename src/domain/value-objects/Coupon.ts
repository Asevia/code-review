import { Money } from './Money.js';

export type CouponType = 'PERCENTAGE' | 'FIXED';

export interface CouponProps {
  code: string;
  type: CouponType;
  value: number;
  expiresAt: Date;
}

export class Coupon {
  private constructor(
    public readonly code: string,
    public readonly type: CouponType,
    public readonly value: number,
    public readonly expiresAt: Date
  ) {
    this.validate();
  }

  static create(props: CouponProps): Coupon {
    return new Coupon(props.code, props.type, props.value, props.expiresAt);
  }

  isValid(): boolean {
    return new Date() < this.expiresAt;
  }

  calculateDiscount(amount: Money): Money {
    if (!this.isValid()) {
      throw new Error('Coupon has expired');
    }

    if (this.type === 'PERCENTAGE') {
      return amount.percentage(this.value);
    }

    // FIXED type
    const discountAmount = Money.create(this.value, amount.currency);
    return amount.isGreaterThan(discountAmount)
      ? discountAmount
      : Money.create(amount.amount, amount.currency);
  }

  private validate(): void {
    if (!this.code || this.code.trim() === '') {
      throw new Error('Coupon code is required');
    }
    if (this.value <= 0) {
      throw new Error('Coupon value must be positive');
    }
    if (this.type === 'PERCENTAGE' && this.value > 100) {
      throw new Error('Percentage coupon cannot exceed 100%');
    }
  }

  toJSON() {
    return {
      code: this.code,
      type: this.type,
      value: this.value,
      expiresAt: this.expiresAt.toISOString(),
    };
  }
}
