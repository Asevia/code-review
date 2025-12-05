import * as cron from 'node-cron';
import { IOrderRepository } from '../../domain/repositories/IOrderRepository.js';
import { IProductRepository } from '../../domain/repositories/IProductRepository.js';

export class StockReservationCleanupJob {
  private task: ReturnType<typeof cron.schedule> | null = null;

  constructor(
    private orderRepository: IOrderRepository,
    private productRepository: IProductRepository
  ) {}

  start(): void {
    // Run every minute
    this.task = cron.schedule('* * * * *', async () => {
      await this.cleanupExpiredReservations();
    });
    console.log('Stock reservation cleanup job started');
  }

  stop(): void {
    if (this.task) {
      this.task.stop();
      console.log('Stock reservation cleanup job stopped');
    }
  }

  private async cleanupExpiredReservations(): Promise<void> {
    try {
      const expiredOrders = await this.orderRepository.findExpiredReservations();

      for (const order of expiredOrders) {
        // Release stock for each item
        for (const item of order.items) {
          const product = await this.productRepository.findById(item.productId);
          if (product) {
            product.releaseStock(item.quantity);
            await this.productRepository.update(product);
          }
        }

        // Mark order as expired
        order.markAsExpired();
        await this.orderRepository.update(order);
      }

      if (expiredOrders.length > 0) {
        console.log(`Cleaned up ${expiredOrders.length} expired order(s)`);
      }
    } catch (error) {
      console.error('Error cleaning up expired reservations:', error);
    }
  }
}
