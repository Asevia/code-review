import mongoose, { Schema, Document } from 'mongoose';
import { Product } from '../../domain/entities/Product.js';
import { Money } from '../../domain/value-objects/Money.js';
import { IProductRepository } from '../../domain/repositories/IProductRepository.js';

interface ProductDocument extends Document {
  productId: string;
  name: string;
  price: {
    amount: number;
    currency: string;
  };
  stockQuantity: number;
  category?: string;
  imageUrl?: string;
}

const ProductSchema = new Schema<ProductDocument>({
  productId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  price: {
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: 'USD' },
  },
  stockQuantity: { type: Number, required: true, default: 0 },
  category: { type: String },
  imageUrl: { type: String },
});

const ProductModel = mongoose.model<ProductDocument>('Product', ProductSchema);

export class MongoProductRepository implements IProductRepository {
  async findById(productId: string): Promise<Product | null> {
    const doc = await ProductModel.findOne({ productId });
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async findByIds(productIds: string[]): Promise<Product[]> {
    const docs = await ProductModel.find({ productId: { $in: productIds } });
    return docs.map((doc) => this.toDomain(doc));
  }

  async update(product: Product): Promise<void> {
    await ProductModel.updateOne(
      { productId: product.productId },
      {
        $set: {
          stockQuantity: product.stockQuantity,
        },
      }
    );
  }

  private toDomain(doc: ProductDocument): Product {
    return Product.create({
      productId: doc.productId,
      name: doc.name,
      price: Money.create(doc.price.amount, doc.price.currency),
      stockQuantity: doc.stockQuantity,
      category: doc.category,
      imageUrl: doc.imageUrl,
    });
  }

  // Helper method for seeding
  static async seed(products: Product[]): Promise<void> {
    for (const product of products) {
      await ProductModel.updateOne(
        { productId: product.productId },
        {
          $set: {
            productId: product.productId,
            name: product.name,
            price: product.price.toJSON(),
            stockQuantity: product.stockQuantity,
            ...(product.category && { category: product.category }),
            ...(product.imageUrl && { imageUrl: product.imageUrl }),
          },
        },
        { upsert: true }
      );
    }
  }
}

export { ProductModel };
