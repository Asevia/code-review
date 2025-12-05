import { Money } from '../value-objects/Money.js';

export interface OrderItemProps {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: Money;
}

export class OrderItem {
  private constructor(
    public readonly productId: string,
    public readonly productName: string,
    public readonly quantity: number,
    public readonly unitPrice: Money
  ) {
    this.validate();
  }

  static create(props: OrderItemProps): OrderItem {
    return new OrderItem(
      props.productId,
      props.productName,
      props.quantity,
      props.unitPrice
    );
  }

  getSubtotal(): Money {
    return this.unitPrice.multiply(this.quantity);
  }

  private validate(): void {
    if (!this.productId || this.productId.trim() === '') {
      throw new Error('Product ID is required');
    }
    if (!this.productName || this.productName.trim() === '') {
      throw new Error('Product name is required');
    }
    if (this.quantity <= 0) {
      throw new Error('Quantity must be positive');
    }
  }

  toJSON() {
    return {
      productId: this.productId,
      productName: this.productName,
      quantity: this.quantity,
      unitPrice: this.unitPrice.toJSON(),
      subtotal: this.getSubtotal().toJSON(),
    };
  }
}
