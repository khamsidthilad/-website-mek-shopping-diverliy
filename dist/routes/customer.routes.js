"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/customerRoutes.ts
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth.");
const customer_controller_1 = __importDefault(require("../controller/customer.controller"));
const router = express_1.default.Router();
router.get('/all', auth_1.authenticate, auth_1.isStaff, customer_controller_1.default.getAllCustomers);
router.get('/search', auth_1.authenticate, auth_1.isStaff, customer_controller_1.default.searchCustomers);
router.get('/stats', auth_1.authenticate, auth_1.isStaff, customer_controller_1.default.getCustomerStats);
router.post('/create', auth_1.authenticate, auth_1.isAdmin, customer_controller_1.default.createCustomer);
router.delete('/:id', auth_1.authenticate, auth_1.isAdmin, customer_controller_1.default.deleteCustomer);
router.get('/:id', auth_1.authenticate, auth_1.isOwnCustomer, customer_controller_1.default.getCustomerById);
router.put('/:id', auth_1.authenticate, auth_1.isOwnCustomer, customer_controller_1.default.updateCustomer);
// router.put(
//     '/:id/password',
//     authenticate,
//     isOwnCustomer,
//     CustomerController.updatePassword
// );
router.get('/:id/orders', auth_1.authenticate, auth_1.isOwnCustomer, customer_controller_1.default.getCustomerOrders);
exports.default = router;
//# sourceMappingURL=customer.routes.js.map