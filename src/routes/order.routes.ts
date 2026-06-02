import express from 'express';
import { authenticate, isCustomer, isOwnCustomer, isStaff } from '../middleware/auth.';
import OrderController from '../controller/order.controller';
import { handleUploadError, uploadPaymentReceipt } from '../middleware/upload';

const router = express.Router();

router.get('/report', authenticate, isStaff, OrderController.getReportOrder);
router.post('/create', authenticate, isCustomer, OrderController.createOrder);
router.post(
    '/:orderId/payment',
    authenticate,
    isCustomer,
    uploadPaymentReceipt,
    handleUploadError,
    OrderController.uploadPaymentReceipt
);

router.get('/:orderId', authenticate, OrderController.getOrderDetails);
router.put('/:orderId/status', authenticate, isStaff, OrderController.updateOrderStatus);
router.get('/customers/:id/orders', authenticate, isOwnCustomer, OrderController.getCustomerOrders);
// router.get('/', authenticate, isStaff, OrderController.getAllOrders);

export default router;