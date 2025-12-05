import { Product } from '../entities/Product.js';

export interface IProductRepository {
  findById(productId: string): Promise<Product | null>;
  findByIds(productIds: string[]): Promise<Product[]>;
  update(product: Product): Promise<void>;
}
