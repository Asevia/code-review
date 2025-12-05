import { Coupon } from '../value-objects/Coupon.js';

export interface ICouponRepository {
  findByCode(code: string): Promise<Coupon | null>;
}
