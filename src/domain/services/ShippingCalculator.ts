import { Address } from '../value-objects/Address.js';
import { Money } from '../value-objects/Money.js';

export class ShippingCalculator {
  private static readonly THRESHOLDS = {
    EU: { threshold: 100, baseCost: 4 },
    USA: { threshold: 150, baseCost: 10 },
  };

  calculateShippingCost(address: Address, purchaseAmount: Money): Money {
    const region = address.getRegion();

    if (region === 'OTHER') {
      throw new Error('Shipping not available for this region');
    }

    const config = ShippingCalculator.THRESHOLDS[region];
    const thresholdMoney = Money.create(config.threshold, purchaseAmount.currency);

    if (purchaseAmount.isGreaterThan(thresholdMoney) || purchaseAmount.equals(thresholdMoney)) {
      return Money.zero(purchaseAmount.currency);
    }

    return Money.create(config.baseCost, purchaseAmount.currency);
  }
}
