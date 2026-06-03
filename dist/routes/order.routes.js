"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth.");
const order_controller_1 = __importDefault(require("../controller/order.controller"));
const upload_1 = require("../middleware/upload");
const router = express_1.default.Router();
router.get('/report', auth_1.authenticate, auth_1.isStaff, order_controller_1.default.getReportOrder);
router.post('/create', auth_1.authenticate, auth_1.isCustomer, order_controller_1.default.createOrder);
router.post('/:orderId/payment', auth_1.authenticate, auth_1.isCustomer, upload_1.uploadPaymentReceipt, upload_1.handleUploadError, order_controller_1.default.uploadPaymentReceipt);
router.get('/:orderId', auth_1.authenticate, order_controller_1.default.getOrderDetails);
router.put('/:orderId/status', auth_1.authenticate, auth_1.isStaff, order_controller_1.default.updateOrderStatus);
router.get('/customers/:id/orders', auth_1.authenticate, auth_1.isOwnCustomer, order_controller_1.default.getCustomerOrders);
// router.get('/', authenticate, isStaff, OrderController.getAllOrders);
exports.default = router;
//# sourceMappingURL=order.routes.js.map