import dotenv from 'dotenv';
import { connectDatabase, disconnectDatabase } from './database.js';
import { MongoProductRepository } from '../adapters/MongoProductRepository.js';
import { MongoCouponRepository } from '../adapters/MongoCouponRepository.js';
import { Product } from '../../domain/entities/Product.js';
import { Money } from '../../domain/value-objects/Money.js';

dotenv.config();

async function seed() {
  try {
    await connectDatabase();
    console.log('Seeding database...');

    // Seed products
    const products = [
      Product.create({
        productId: 'BD23672983',
        name: 'D.O.N ISSUE #6',
        price: Money.create(123.38),
        stockQuantity: 50,
        category: 'Basketball',
        imageUrl: 'https://example.com/shoes.jpg',
      }),
      Product.create({
        productId: 'PROD001',
        name: 'Running Shoes Pro',
        price: Money.create(89.99),
        stockQuantity: 100,
        category: 'Running',
      }),
      Product.create({
        productId: 'PROD002',
        name: 'Training Shorts',
        price: Money.create(34.99),
        stockQuantity: 200,
        category: 'Apparel',
      }),
      Product.create({
        productId: 'PROD003',
        name: 'Sports Water Bottle',
        price: Money.create(15.99),
        stockQuantity: 500,
        category: 'Accessories',
      }),
    ];

    await MongoProductRepository.seed(products);
    console.log(`Seeded ${products.length} products`);

    // Seed coupons
    const coupons = [
      {
        code: 'SAVE10',
        type: 'PERCENTAGE' as const,
        value: 10,
        expiresAt: new Date('2026-12-31'),
      },
      {
        code: 'SAVE20',
        type: 'PERCENTAGE' as const,
        value: 20,
        expiresAt: new Date('2026-12-31'),
      },
      {
        code: 'FLAT15',
        type: 'FIXED' as const,
        value: 15,
        expiresAt: new Date('2026-12-31'),
      },
      {
        code: 'SUMMER25',
        type: 'PERCENTAGE' as const,
        value: 25,
        expiresAt: new Date('2026-06-30'),
      },
    ];

    await MongoCouponRepository.seed(coupons);
    console.log(`Seeded ${coupons.length} coupons`);

    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await disconnectDatabase();
  }
}

seed();
