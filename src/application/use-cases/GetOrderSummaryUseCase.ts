import { IOrderRepository } from '../../domain/repositories/IOrderRepository.js';
import { PricingService } from '../../domain/services/PricingService.js';
import { OrderDTO, OrderDTOMapper } from '../dtos/OrderDTO.js';

export class GetOrderSummaryUseCase {
  constructor(
    private orderRepository: IOrderRepository,
    private pricingService: PricingService
  ) {}

  async execute(orderId: string): Promise<OrderDTO> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    const totals = this.pricingService.calculateTotal(order);
    return OrderDTOMapper.toDTO(order, totals);
  }
}
