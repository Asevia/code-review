import { Router } from 'express';
import { CheckoutController } from './CheckoutController.js';

export function createCheckoutRoutes(controller: CheckoutController): Router {
  const router = Router();

  router.post('/checkout/initiate', (req, res) =>
    controller.initiateCheckout(req, res)
  );

  router.post('/checkout/:orderId/coupon', (req, res) =>
    controller.applyCoupon(req, res)
  );

  router.put('/checkout/:orderId/payment-method', (req, res) =>
    controller.updatePaymentMethod(req, res)
  );

  router.get('/checkout/:orderId', (req, res) =>
    controller.getOrderSummary(req, res)
  );

  router.post('/checkout/:orderId/complete', (req, res) =>
    controller.processPayment(req, res)
  );

  return router;
}
