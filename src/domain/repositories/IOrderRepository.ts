import { Order } from '../entities/Order.js';

export interface IOrderRepository {
  save(order: Order): Promise<void>;
  findById(orderId: string): Promise<Order | null>;
  findExpiredReservations(): Promise<Order[]>;
  update(order: Order): Promise<void>;
}
