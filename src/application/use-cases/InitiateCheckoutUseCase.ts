import { Order } from '../../domain/entities/Order.js';
import { OrderItem } from '../../domain/entities/OrderItem.js';
import { Address, AddressProps } from '../../domain/value-objects/Address.js';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository.js';
import { IProductRepository } from '../../domain/repositories/IProductRepository.js';
import { PricingService } from '../../domain/services/PricingService.js';
import { OrderDTO, OrderDTOMapper } from '../dtos/OrderDTO.js';

export interface InitiateCheckoutInput {
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  address: AddressProps;
}

export class InitiateCheckoutUseCase {
  constructor(
    private orderRepository: IOrderRepository,
    private productRepository: IProductRepository,
    private pricingService: PricingService
  ) {}

  async execute(input: InitiateCheckoutInput): Promise<OrderDTO> {
    // Validate and fetch products
    const productIds = input.items.map((item) => item.productId);
    const products = await this.productRepository.findByIds(productIds);

    if (products.length !== productIds.length) {
      throw new Error('One or more products not found');
    }

    // Check stock availability and reserve
    for (const inputItem of input.items) {
      const product = products.find((p) => p.productId === inputItem.productId);
      if (!product) {
        throw new Error(`Product ${inputItem.productId} not found`);
      }

      if (!product.isAvailable(inputItem.quantity)) {
        throw new Error(
          `Insufficient stock for product ${product.name}. Available: ${product.stockQuantity}`
        );
      }

      // Reserve stock
      product.reserveStock(inputItem.quantity);
      await this.productRepository.update(product);
    }

    // Create order items
    const orderItems = input.items.map((inputItem) => {
      const product = products.find((p) => p.productId === inputItem.productId)!;
      return OrderItem.create({
        productId: product.productId,
        productName: product.name,
        quantity: inputItem.quantity,
        unitPrice: product.price,
      });
    });

    // Create order
    const address = Address.create(input.address);
    const order = Order.create({
      customerId: input.customerId,
      items: orderItems,
      address,
    });

    // Reserve order for 15 minutes
    order.reserve(15);

    // Save order
    await this.orderRepository.save(order);

    // Calculate totals and return DTO
    const totals = this.pricingService.calculateTotal(order);
    return OrderDTOMapper.toDTO(order, totals);
  }
}
