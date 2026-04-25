// src/routes/customerRoutes.ts
import express from 'express';
import { authenticate, isAdmin, isOwnCustomer, isStaff } from '../middleware/auth.';
import CustomerController from '../controller/customer.controller';

const router = express.Router();

router.get(
    '/all',
    authenticate,
    isStaff,
    CustomerController.getAllCustomers
);
router.get(
    '/search',
    authenticate,
    isStaff,
    CustomerController.searchCustomers
);
router.get(
    '/stats',
    authenticate,
    isStaff,
    CustomerController.getCustomerStats
);
router.post(
    '/create',
    authenticate,
    isAdmin,
    CustomerController.createCustomer
);
router.delete(
    '/:id',
    authenticate,
    isAdmin,
    CustomerController.deleteCustomer
);
router.get(
    '/:id',
    authenticate,
    isOwnCustomer,
    CustomerController.getCustomerById
);
router.put(
    '/:id',
    authenticate,
    isOwnCustomer,
    CustomerController.updateCustomer
);
// router.put(
//     '/:id/password',
//     authenticate,
//     isOwnCustomer,
//     CustomerController.updatePassword
// );
router.get(
    '/:id/orders',
    authenticate,
    isOwnCustomer,
    CustomerController.getCustomerOrders
);

export default router;