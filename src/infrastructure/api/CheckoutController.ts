import { Request, Response } from 'express';
import { InitiateCheckoutUseCase } from '../../application/use-cases/InitiateCheckoutUseCase.js';
import { ApplyCouponUseCase } from '../../application/use-cases/ApplyCouponUseCase.js';
import { UpdatePaymentMethodUseCase } from '../../application/use-cases/UpdatePaymentMethodUseCase.js';
import { GetOrderSummaryUseCase } from '../../application/use-cases/GetOrderSummaryUseCase.js';
import { ProcessPaymentUseCase } from '../../application/use-cases/ProcessPaymentUseCase.js';

export class CheckoutController {
  constructor(
    private initiateCheckoutUseCase: InitiateCheckoutUseCase,
    private applyCouponUseCase: ApplyCouponUseCase,
    private updatePaymentMethodUseCase: UpdatePaymentMethodUseCase,
    private getOrderSummaryUseCase: GetOrderSummaryUseCase,
    private processPaymentUseCase: ProcessPaymentUseCase
  ) {}

  async initiateCheckout(req: Request, res: Response): Promise<void> {
    try {
      const orderDTO = await this.initiateCheckoutUseCase.execute(req.body);
      res.status(201).json(orderDTO);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to initiate checkout',
      });
    }
  }

  async applyCoupon(req: Request, res: Response): Promise<void> {
    try {
      const totals = await this.applyCouponUseCase.execute({
        orderId: req.params.orderId,
        couponCode: req.body.couponCode,
      });
      res.json(totals);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to apply coupon',
      });
    }
  }

  async updatePaymentMethod(req: Request, res: Response): Promise<void> {
    try {
      const totals = await this.updatePaymentMethodUseCase.execute({
        orderId: req.params.orderId,
        paymentMethod: req.body,
      });
      res.json(totals);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to update payment method',
      });
    }
  }

  async getOrderSummary(req: Request, res: Response): Promise<void> {
    try {
      const orderDTO = await this.getOrderSummaryUseCase.execute(req.params.orderId);
      res.json(orderDTO);
    } catch (error) {
      res.status(404).json({
        error: error instanceof Error ? error.message : 'Order not found',
      });
    }
  }

  async processPayment(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.processPaymentUseCase.execute(req.params.orderId);
      res.json(result);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : 'Failed to process payment',
      });
    }
  }
}
