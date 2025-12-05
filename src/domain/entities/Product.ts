import { Money } from '../value-objects/Money.js';

export interface ProductProps {
  productId: string;
  name: string;
  price: Money;
  stockQuantity: number;
  category?: string;
  imageUrl?: string;
}

export class Product {
  private constructor(
    public readonly productId: string,
    public readonly name: string,
    public readonly price: Money,
    private _stockQuantity: number,
    public readonly category?: string,
    public readonly imageUrl?: string
  ) {
    this.validate();
  }

  static create(props: ProductProps): Product {
    return new Product(
      props.productId,
      props.name,
      props.price,
      props.stockQuantity,
      props.category,
      props.imageUrl
    );
  }

  get stockQuantity(): number {
    return this._stockQuantity;
  }

  reserveStock(quantity: number): void {
    if (quantity <= 0) {
      throw new Error('Quantity must be positive');
    }
    if (this._stockQuantity < quantity) {
      throw new Error(
        `Insufficient stock. Available: ${this._stockQuantity}, Requested: ${quantity}`
      );
    }
    this._stockQuantity -= quantity;
  }

  releaseStock(quantity: number): void {
    if (quantity <= 0) {
      throw new Error('Quantity must be positive');
    }
    this._stockQuantity += quantity;
  }

  isAvailable(quantity: number): boolean {
    return this._stockQuantity >= quantity;
  }

  private validate(): void {
    if (!this.productId || this.productId.trim() === '') {
      throw new Error('Product ID is required');
    }
    if (!this.name || this.name.trim() === '') {
      throw new Error('Product name is required');
    }
    if (this._stockQuantity < 0) {
      throw new Error('Stock quantity cannot be negative');
    }
  }

  toJSON() {
    return {
      productId: this.productId,
      name: this.name,
      price: this.price.toJSON(),
      stockQuantity: this._stockQuantity,
      ...(this.category && { category: this.category }),
      ...(this.imageUrl && { imageUrl: this.imageUrl }),
    };
  }
}
