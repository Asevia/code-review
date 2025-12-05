import { ShippingCalculator } from '../ShippingCalculator.js';
import { Address } from '../../value-objects/Address.js';
import { Money } from '../../value-objects/Money.js';

describe('ShippingCalculator', () => {
  let calculator: ShippingCalculator;

  beforeEach(() => {
    calculator = new ShippingCalculator();
  });

  describe('EU region shipping', () => {
    const euAddress = Address.create({
      street: '123 Main St',
      city: 'Paris',
      state: 'Ile-de-France',
      country: 'FR',
      postalCode: '75001',
      phone: '+33123456789',
    });

    it('should charge $4 for purchases under $100', () => {
      const purchaseAmount = Money.create(50);
      const shippingCost = calculator.calculateShippingCost(euAddress, purchaseAmount);

      expect(shippingCost.amount).toBe(4);
      expect(shippingCost.currency).toBe('USD');
    });

    it('should be free for purchases of exactly $100', () => {
      const purchaseAmount = Money.create(100);
      const shippingCost = calculator.calculateShippingCost(euAddress, purchaseAmount);

      expect(shippingCost.amount).toBe(0);
    });

    it('should be free for purchases over $100', () => {
      const purchaseAmount = Money.create(150);
      const shippingCost = calculator.calculateShippingCost(euAddress, purchaseAmount);

      expect(shippingCost.amount).toBe(0);
    });
  });

  describe('USA region shipping', () => {
    const usaAddress = Address.create({
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      postalCode: '10001',
      phone: '+11234567890',
    });

    it('should charge $10 for purchases under $150', () => {
      const purchaseAmount = Money.create(100);
      const shippingCost = calculator.calculateShippingCost(usaAddress, purchaseAmount);

      expect(shippingCost.amount).toBe(10);
      expect(shippingCost.currency).toBe('USD');
    });

    it('should be free for purchases of exactly $150', () => {
      const purchaseAmount = Money.create(150);
      const shippingCost = calculator.calculateShippingCost(usaAddress, purchaseAmount);

      expect(shippingCost.amount).toBe(0);
    });

    it('should be free for purchases over $150', () => {
      const purchaseAmount = Money.create(200);
      const shippingCost = calculator.calculateShippingCost(usaAddress, purchaseAmount);

      expect(shippingCost.amount).toBe(0);
    });
  });

  describe('OTHER region shipping', () => {
    const otherAddress = Address.create({
      street: '123 Main St',
      city: 'Tokyo',
      state: 'Tokyo',
      country: 'JP',
      postalCode: '100-0001',
      phone: '+81312345678',
    });

    it('should throw error for unsupported regions', () => {
      const purchaseAmount = Money.create(100);

      expect(() => {
        calculator.calculateShippingCost(otherAddress, purchaseAmount);
      }).toThrow('Shipping not available for this region');
    });
  });
});
