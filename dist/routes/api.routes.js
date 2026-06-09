"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/api.ts
const express_1 = __importDefault(require("express"));
const auth_routes_1 = __importDefault(require("./auth.routes"));
const product_routes_1 = __importDefault(require("./product.routes"));
const customer_routes_1 = __importDefault(require("./customer.routes"));
const category_routes_1 = __importDefault(require("./category.routes"));
const order_routes_1 = __importDefault(require("./order.routes"));
const bill_routes_1 = __importDefault(require("./bill.routes"));
const supplier_routes_1 = __importDefault(require("./supplier.routes"));
const import_routes_1 = __importDefault(require("./import.routes"));
const brand_routes_1 = __importDefault(require("./brand.routes"));
const brandCate_routes_1 = __importDefault(require("./brandCate.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
const contact_routes_1 = __importDefault(require("./contact.routes"));
const router = express_1.default.Router();
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'API is running'
    });
});
router.get('/version', (req, res) => {
    res.status(200).json({
        version: '1.0.0',
        name: 'Shop API'
    });
});
router.use('/auth', auth_routes_1.default);
router.use('/products', product_routes_1.default);
router.use('/customers', customer_routes_1.default);
router.use('/categories', category_routes_1.default);
router.use('/orders', order_routes_1.default);
router.use('/bills', bill_routes_1.default);
router.use('/suppliers', supplier_routes_1.default);
router.use('/imports', import_routes_1.default);
router.use('/brands', brand_routes_1.default);
router.use('/brand-category', brandCate_routes_1.default);
router.use('/users', user_routes_1.default);
router.use('/contact', contact_routes_1.default);
exports.default = router;
//# sourceMappingURL=api.routes.js.map