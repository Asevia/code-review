import { PricingService } from '../PricingService.js';
import { ShippingCalculator } from '../ShippingCalculator.js';
import { Order } from '../../entities/Order.js';
import { OrderItem } from '../../entities/OrderItem.js';
import { Address } from '../../value-objects/Address.js';
import { Money } from '../../value-objects/Money.js';
import { PaymentMethod } from '../../value-objects/PaymentMethod.js';
import { Coupon } from '../../value-objects/Coupon.js';

describe('PricingService', () => {
  let pricingService: PricingService;
  let shippingCalculator: ShippingCalculator;

  beforeEach(() => {
    shippingCalculator = new ShippingCalculator();
    pricingService = new PricingService(shippingCalculator);
  });

  describe('calculateSubtotal', () => {
    it('should calculate subtotal for multiple items', () => {
      const items = [
        OrderItem.create({
          productId: '1',
          productName: 'Product 1',
          quantity: 2,
          unitPrice: Money.create(50),
        }),
        OrderItem.create({
          productId: '2',
          productName: 'Product 2',
          quantity: 1,
          unitPrice: Money.create(30),
        }),
      ];

      const subtotal = pricingService.calculateSubtotal(items);

      expect(subtotal.amount).toBe(130); // (2 * 50) + (1 * 30)
    });

    it('should return zero for empty items', () => {
      const subtotal = pricingService.calculateSubtotal([]);

      expect(subtotal.amount).toBe(0);
    });
  });

  describe('applyCouponDiscount', () => {
    it('should apply percentage discount', () => {
      const subtotal = Money.create(100);
      const coupon = Coupon.create({
        code: 'SAVE10',
        type: 'PERCENTAGE',
        value: 10,
        expiresAt: new Date('2026-12-31'),
      });

      const discount = pricingService.applyCouponDiscount(subtotal, coupon);

      expect(discount.amount).toBe(10); // 10% of 100
    });

    it('should apply fixed amount discount', () => {
      const subtotal = Money.create(100);
      const coupon = Coupon.create({
        code: 'FLAT15',
        type: 'FIXED',
        value: 15,
        expiresAt: new Date('2026-12-31'),
      });

      const discount = pricingService.applyCouponDiscount(subtotal, coupon);

      expect(discount.amount).toBe(15);
    });

    it('should return zero for null coupon', () => {
      const subtotal = Money.create(100);
      const discount = pricingService.applyCouponDiscount(subtotal, null);

      expect(discount.amount).toBe(0);
    });
  });

  describe('applyPaymentFee', () => {
    it('should apply payment fee for PayPal', () => {
      const amount = Money.create(100);
      const paymentMethod = PaymentMethod.create({
        type: 'PAYPAL',
      });

      const fee = pricingService.applyPaymentFee(amount, paymentMethod);

      expect(fee.amount).toBe(3.5); // 3.5% of 100
    });

    it('should not apply fee for bank transfer', () => {
      const amount = Money.create(100);
      const paymentMethod = PaymentMethod.create({
        type: 'BANK_TRANSFER',
      });

      const fee = pricingService.applyPaymentFee(amount, paymentMethod);

      expect(fee.amount).toBe(0);
    });

    it('should apply fee for pay later', () => {
      const amount = Money.create(100);
      const paymentMethod = PaymentMethod.create({
        type: 'PAY_LATER',
        installments: 4,
      });

      const fee = pricingService.applyPaymentFee(amount, paymentMethod);

      expect(fee.amount).toBe(2); // 2% of 100
    });

    it('should return zero for null payment method', () => {
      const amount = Money.create(100);
      const fee = pricingService.applyPaymentFee(amount, null);

      expect(fee.amount).toBe(0);
    });
  });

  describe('calculateTotal', () => {
    it('should calculate complete totals with all components', () => {
      const items = [
        OrderItem.create({
          productId: '1',
          productName: 'Product 1',
          quantity: 1,
          unitPrice: Money.create(90),
        }),
      ];

      const address = Address.create({
        street: '123 Main St',
        city: 'Paris',
        state: 'Ile-de-France',
        country: 'FR',
        postalCode: '75001',
        phone: '+33123456789',
      });

      const coupon = Coupon.create({
        code: 'SAVE10',
        type: 'PERCENTAGE',
        value: 10,
        expiresAt: new Date('2026-12-31'),
      });

      const paymentMethod = PaymentMethod.create({
        type: 'PAYPAL',
      });

      const order = Order.create({
        customerId: 'customer1',
        items,
        address,
        paymentMethod,
        coupon,
      });

      const totals = pricingService.calculateTotal(order);

      expect(totals.subtotal.amount).toBe(90);
      expect(totals.discount.amount).toBe(9); // 10% of 90
      expect(totals.shippingCost.amount).toBe(4); // 90-9=81 < 100, so $4 shipping
      expect(totals.paymentFee.amount).toBe(2.975); // 3.5% of (81 + 4) = 3.5% of 85
      expect(totals.total.amount).toBeCloseTo(87.975); // 81 + 4 + 2.975
    });

    it('should calculate with free shipping for orders over threshold', () => {
      const items = [
        OrderItem.create({
          productId: '1',
          productName: 'Product 1',
          quantity: 1,
          unitPrice: Money.create(150),
        }),
      ];

      const address = Address.create({
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postalCode: '10001',
        phone: '+11234567890',
      });

      const order = Order.create({
        customerId: 'customer1',
        items,
        address,
      });

      const totals = pricingService.calculateTotal(order);

      expect(totals.subtotal.amount).toBe(150);
      expect(totals.discount.amount).toBe(0);
      expect(totals.shippingCost.amount).toBe(0); // Free shipping
      expect(totals.total.amount).toBe(150);
    });
  });
});
