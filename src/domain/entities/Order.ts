import { v4 as uuidv4 } from 'uuid';
import { OrderItem } from './OrderItem.js';
import { Address } from '../value-objects/Address.js';
import { PaymentMethod } from '../value-objects/PaymentMethod.js';
import { Coupon } from '../value-objects/Coupon.js';
import { OrderStatus, OrderStatusValidator } from '../value-objects/OrderStatus.js';

export interface OrderProps {
  orderId?: string;
  customerId: string;
  items: OrderItem[];
  address: Address;
  paymentMethod?: PaymentMethod;
  coupon?: Coupon | null;
  status?: OrderStatus;
  reservationExpiresAt?: Date;
  createdAt?: Date;
}

export class Order {
  private constructor(
    public readonly orderId: string,
    public readonly customerId: string,
    private _items: OrderItem[],
    private _address: Address,
    private _paymentMethod: PaymentMethod | null,
    private _coupon: Coupon | null,
    private _status: OrderStatus,
    private _reservationExpiresAt: Date | null,
    public readonly createdAt: Date
  ) {
    this.validate();
  }

  static create(props: OrderProps): Order {
    return new Order(
      props.orderId || uuidv4(),
      props.customerId,
      props.items,
      props.address,
      props.paymentMethod || null,
      props.coupon || null,
      props.status || OrderStatus.DRAFT,
      props.reservationExpiresAt || null,
      props.createdAt || new Date()
    );
  }

  get items(): OrderItem[] {
    return [...this._items];
  }

  get address(): Address {
    return this._address;
  }

  get paymentMethod(): PaymentMethod | null {
    return this._paymentMethod;
  }

  get coupon(): Coupon | null {
    return this._coupon;
  }

  get status(): OrderStatus {
    return this._status;
  }

  get reservationExpiresAt(): Date | null {
    return this._reservationExpiresAt;
  }

  addItem(item: OrderItem): void {
    if (this._status !== OrderStatus.DRAFT) {
      throw new Error('Cannot modify items in non-draft order');
    }
    this._items.push(item);
  }

  removeItem(productId: string): void {
    if (this._status !== OrderStatus.DRAFT) {
      throw new Error('Cannot modify items in non-draft order');
    }
    this._items = this._items.filter((item) => item.productId !== productId);
  }

  updateAddress(address: Address): void {
    if (this._status !== OrderStatus.DRAFT && this._status !== OrderStatus.RESERVED) {
      throw new Error('Cannot update address after payment process started');
    }
    this._address = address;
  }

  updatePaymentMethod(paymentMethod: PaymentMethod): void {
    this._paymentMethod = paymentMethod;
  }

  applyCoupon(coupon: Coupon): void {
    if (!coupon.isValid()) {
      throw new Error('Coupon has expired');
    }
    this._coupon = coupon;
  }

  removeCoupon(): void {
    this._coupon = null;
  }

  reserve(expirationMinutes: number = 15): void {
    OrderStatusValidator.validateTransition(this._status, OrderStatus.RESERVED);
    this._status = OrderStatus.RESERVED;
    this._reservationExpiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);
  }

  startPayment(): void {
    this.ensureNotExpired();
    OrderStatusValidator.validateTransition(this._status, OrderStatus.PAYMENT_PENDING);
    this._status = OrderStatus.PAYMENT_PENDING;
  }

  completePurchase(): void {
    this.ensureNotExpired();
    if (this._status === OrderStatus.RESERVED) {
      this._status = OrderStatus.PAYMENT_PENDING;
    }
    OrderStatusValidator.validateTransition(this._status, OrderStatus.PAID);
    this._status = OrderStatus.PAID;
    this._reservationExpiresAt = null; // Clear expiration after payment
  }

  markAsExpired(): void {
    OrderStatusValidator.validateTransition(this._status, OrderStatus.EXPIRED);
    this._status = OrderStatus.EXPIRED;
  }

  isExpired(): boolean {
    if (!this._reservationExpiresAt) {
      return false;
    }
    return new Date() > this._reservationExpiresAt;
  }

  private ensureNotExpired(): void {
    if (this.isExpired()) {
      throw new Error('Order reservation has expired');
    }
  }

  private validate(): void {
    if (!this.orderId || this.orderId.trim() === '') {
      throw new Error('Order ID is required');
    }
    if (!this.customerId || this.customerId.trim() === '') {
      throw new Error('Customer ID is required');
    }
    if (this._items.length === 0) {
      throw new Error('Order must contain at least one item');
    }
  }

  toJSON() {
    return {
      orderId: this.orderId,
      customerId: this.customerId,
      items: this._items.map((item) => item.toJSON()),
      address: this._address.toJSON(),
      paymentMethod: this._paymentMethod?.toJSON() || null,
      coupon: this._coupon?.toJSON() || null,
      status: this._status,
      reservationExpiresAt: this._reservationExpiresAt?.toISOString() || null,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
