import mongoose, { Schema, Document } from 'mongoose';
import { Coupon } from '../../domain/value-objects/Coupon.js';
import { ICouponRepository } from '../../domain/repositories/ICouponRepository.js';

interface CouponDocument extends Document {
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  expiresAt: Date;
}

const CouponSchema = new Schema<CouponDocument>({
  code: { type: String, required: true, unique: true, index: true },
  type: { type: String, enum: ['PERCENTAGE', 'FIXED'], required: true },
  value: { type: Number, required: true },
  expiresAt: { type: Date, required: true },
});

const CouponModel = mongoose.model<CouponDocument>('Coupon', CouponSchema);

export class MongoCouponRepository implements ICouponRepository {
  async findByCode(code: string): Promise<Coupon | null> {
    const doc = await CouponModel.findOne({ code: code.toUpperCase() });
    if (!doc) return null;
    return this.toDomain(doc);
  }

  private toDomain(doc: CouponDocument): Coupon {
    return Coupon.create({
      code: doc.code,
      type: doc.type,
      value: doc.value,
      expiresAt: doc.expiresAt,
    });
  }

  // Helper method for seeding
  static async seed(coupons: Array<{
    code: string;
    type: 'PERCENTAGE' | 'FIXED';
    value: number;
    expiresAt: Date;
  }>): Promise<void> {
    for (const coupon of coupons) {
      await CouponModel.updateOne(
        { code: coupon.code },
        { $set: coupon },
        { upsert: true }
      );
    }
  }
}

export { CouponModel };
