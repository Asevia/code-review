import express from 'express';
import dotenv from 'dotenv';
import { connectDatabase } from './infrastructure/config/database.js';
import { MongoOrderRepository } from './infrastructure/adapters/MongoOrderRepository.js';
import { MongoProductRepository } from './infrastructure/adapters/MongoProductRepository.js';
import { MongoCouponRepository } from './infrastructure/adapters/MongoCouponRepository.js';
import { ShippingCalculator } from './domain/services/ShippingCalculator.js';
import { PricingService } from './domain/services/PricingService.js';
import { InitiateCheckoutUseCase } from './application/use-cases/InitiateCheckoutUseCase.js';
import { ApplyCouponUseCase } from './application/use-cases/ApplyCouponUseCase.js';
import { UpdatePaymentMethodUseCase } from './application/use-cases/UpdatePaymentMethodUseCase.js';
import { GetOrderSummaryUseCase } from './application/use-cases/GetOrderSummaryUseCase.js';
import { ProcessPaymentUseCase } from './application/use-cases/ProcessPaymentUseCase.js';
import { CheckoutController } from './infrastructure/api/CheckoutController.js';
import { createCheckoutRoutes } from './infrastructure/api/routes.js';
import { StockReservationCleanupJob } from './infrastructure/jobs/StockReservationCleanupJob.js';

dotenv.config();

async function bootstrap() {
  const app = express();
  const port = process.env.PORT || 3000;

  // Middleware
  app.use(express.json());

  // Connect to database
  await connectDatabase();

  // Initialize repositories (adapters)
  const orderRepository = new MongoOrderRepository();
  const productRepository = new MongoProductRepository();
  const couponRepository = new MongoCouponRepository();

  // Initialize domain services
  const shippingCalculator = new ShippingCalculator();
  const pricingService = new PricingService(shippingCalculator);

  // Initialize use cases
  const initiateCheckoutUseCase = new InitiateCheckoutUseCase(
    orderRepository,
    productRepository,
    pricingService
  );
  const applyCouponUseCase = new ApplyCouponUseCase(
    orderRepository,
    couponRepository,
    pricingService
  );
  const updatePaymentMethodUseCase = new UpdatePaymentMethodUseCase(
    orderRepository,
    pricingService
  );
  const getOrderSummaryUseCase = new GetOrderSummaryUseCase(
    orderRepository,
    pricingService
  );
  const processPaymentUseCase = new ProcessPaymentUseCase(orderRepository);

  // Initialize controller
  const checkoutController = new CheckoutController(
    initiateCheckoutUseCase,
    applyCouponUseCase,
    updatePaymentMethodUseCase,
    getOrderSummaryUseCase,
    processPaymentUseCase
  );

  // Register routes
  app.use('/api', createCheckoutRoutes(checkoutController));

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Start background jobs
  const cleanupJob = new StockReservationCleanupJob(
    orderRepository,
    productRepository
  );
  cleanupJob.start();

  // Start server
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log(`API available at http://localhost:${port}/api`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    cleanupJob.stop();
    process.exit(0);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
