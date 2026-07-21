import express from 'express';
import { authenticate, isCustomer, isOwnCustomer, isStaff } from '../middleware/auth.';
import OrderController from '../controller/order.controller';
import PaymentController from '../controller/payment.controller';
import { handleUploadError, uploadPaymentReceipt } from '../middleware/upload';

const router = express.Router();

router.get('/report', authenticate, isStaff, OrderController.getReportOrder);
router.post('/create', authenticate, isCustomer, OrderController.createOrder);

/** PhaJay QR payment */
router.post(
    '/:orderId/payment/qr',
    authenticate,
    isCustomer,
    PaymentController.generateOrderQr
);
router.get(
    '/:orderId/payment/status',
    authenticate,
    PaymentController.getPaymentStatus
);

/** Manual slip upload (fallback) */
router.post(
    '/:orderId/payment',
    authenticate,
    isCustomer,
    uploadPaymentReceipt,
    handleUploadError,
    OrderController.uploadPaymentReceipt
);
router.put('/:orderId/cancel', authenticate, isCustomer, OrderController.cancelOrder);

router.get('/:orderId', authenticate, OrderController.getOrderDetails);
router.put('/:orderId/status', authenticate, isStaff, OrderController.updateOrderStatus);
router.get('/customers/:id/orders', authenticate, isOwnCustomer, OrderController.getCustomerOrders);

export default router;