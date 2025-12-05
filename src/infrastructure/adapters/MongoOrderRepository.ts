import mongoose, { Schema, Document } from 'mongoose';
import { Order } from '../../domain/entities/Order.js';
import { OrderItem } from '../../domain/entities/OrderItem.js';
import { Address } from '../../domain/value-objects/Address.js';
import { PaymentMethod } from '../../domain/value-objects/PaymentMethod.js';
import { Coupon } from '../../domain/value-objects/Coupon.js';
import { OrderStatus } from '../../domain/value-objects/OrderStatus.js';
import { Money } from '../../domain/value-objects/Money.js';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository.js';

interface OrderDocument extends Document {
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
  }>;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    phone: string;
  };
  paymentMethod?: {
    type: string;
    installments?: number;
  };
  coupon?: {
    code: string;
    type: string;
    value: number;
    expiresAt: Date;
  };
  status: string;
  reservationExpiresAt?: Date;
  createdAt: Date;
}

const OrderSchema = new Schema<OrderDocument>({
  orderId: { type: String, required: true, unique: true, index: true },
  customerId: { type: String, required: true, index: true },
  items: [
    {
      productId: { type: String, required: true },
      productName: { type: String, required: true },
      quantity: { type: Number, required: true },
      unitPrice: {
        amount: { type: Number, required: true },
        currency: { type: String, required: true },
      },
    },
  ],
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    postalCode: { type: String, required: true },
    phone: { type: String, required: true },
  },
  paymentMethod: {
    type: {
      type: String,
      enum: ['PAYPAL', 'BANK_TRANSFER', 'PAY_LATER'],
    },
    installments: Number,
  },
  coupon: {
    code: String,
    type: { type: String, enum: ['PERCENTAGE', 'FIXED'] },
    value: Number,
    expiresAt: Date,
  },
  status: {
    type: String,
    enum: ['DRAFT', 'RESERVED', 'PAYMENT_PENDING', 'PAID', 'EXPIRED'],
    required: true,
  },
  reservationExpiresAt: { type: Date, index: true },
  createdAt: { type: Date, required: true, default: Date.now },
});

const OrderModel = mongoose.model<OrderDocument>('Order', OrderSchema);

export class MongoOrderRepository implements IOrderRepository {
  async save(order: Order): Promise<void> {
    const doc = this.toDocument(order);
    await OrderModel.create(doc);
  }

  async findById(orderId: string): Promise<Order | null> {
    const doc = await OrderModel.findOne({ orderId });
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findExpiredReservations(): Promise<Order[]> {
    const docs = await OrderModel.find({
      status: { $in: ['RESERVED', 'PAYMENT_PENDING'] },
      reservationExpiresAt: { $lt: new Date() },
    });
    return docs.map((doc) => this.toDomain(doc));
  }

  async update(order: Order): Promise<void> {
    const doc = this.toDocument(order);
    await OrderModel.updateOne({ orderId: order.orderId }, { $set: doc });
  }

  private toDomain(doc: OrderDocument): Order {
    const items = doc.items.map((item) =>
      OrderItem.create({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: Money.create(item.unitPrice.amount, item.unitPrice.currency),
      })
    );

    const address = Address.create({
      street: doc.address.street,
      city: doc.address.city,
      state: doc.address.state,
      country: doc.address.country,
      postalCode: doc.address.postalCode,
      phone: doc.address.phone,
    });

    let paymentMethod: PaymentMethod | undefined;
    if (doc.paymentMethod) {
      paymentMethod = PaymentMethod.create({
        type: doc.paymentMethod.type as 'PAYPAL' | 'BANK_TRANSFER' | 'PAY_LATER',
        installments: doc.paymentMethod.installments,
      });
    }

    let coupon: Coupon | undefined;
    if (doc.coupon) {
      coupon = Coupon.create({
        code: doc.coupon.code,
        type: doc.coupon.type as 'PERCENTAGE' | 'FIXED',
        value: doc.coupon.value,
        expiresAt: doc.coupon.expiresAt,
      });
    }

    return Order.create({
      orderId: doc.orderId,
      customerId: doc.customerId,
      items,
      address,
      paymentMethod,
      coupon,
      status: doc.status as OrderStatus,
      reservationExpiresAt: doc.reservationExpiresAt,
      createdAt: doc.createdAt,
    });
  }

  private toDocument(order: Order): Partial<OrderDocument> {
    return {
      orderId: order.orderId,
      customerId: order.customerId,
      items: order.items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toJSON(),
      })),
      address: order.address.toJSON(),
      paymentMethod: order.paymentMethod?.toJSON() || undefined,
      coupon: order.coupon
        ? {
            code: order.coupon.code,
            type: order.coupon.type,
            value: order.coupon.value,
            expiresAt: order.coupon.expiresAt,
          }
        : undefined,
      status: order.status,
      reservationExpiresAt: order.reservationExpiresAt || undefined,
      createdAt: order.createdAt,
    };
  }
}

export { OrderModel };
