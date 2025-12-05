export type PaymentMethodType = 'PAYPAL' | 'BANK_TRANSFER' | 'PAY_LATER';

export interface PaymentMethodProps {
  type: PaymentMethodType;
  installments?: number;
}

export class PaymentMethod {
  private static readonly FEE_RATES: Record<PaymentMethodType, number> = {
    PAYPAL: 3.5, // 3.5% fee
    BANK_TRANSFER: 0, // No fee
    PAY_LATER: 2.0, // 2% fee for installment service
  };

  private constructor(
    public readonly type: PaymentMethodType,
    public readonly installments?: number
  ) {
    this.validate();
  }

  static create(props: PaymentMethodProps): PaymentMethod {
    return new PaymentMethod(props.type, props.installments);
  }

  get feePercentage(): number {
    return PaymentMethod.FEE_RATES[this.type];
  }

  private validate(): void {
    if (this.type === 'PAY_LATER' && (!this.installments || this.installments < 2)) {
      throw new Error('PAY_LATER requires at least 2 installments');
    }
    if (this.type !== 'PAY_LATER' && this.installments) {
      throw new Error('Installments only allowed for PAY_LATER payment method');
    }
  }

  toJSON() {
    return {
      type: this.type,
      feePercentage: this.feePercentage,
      ...(this.installments && { installments: this.installments }),
    };
  }
}
