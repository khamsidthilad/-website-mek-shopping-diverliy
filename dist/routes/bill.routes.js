"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const billsellDetail_controller_1 = __importDefault(require("../controller/billsellDetail.controller"));
const auth_1 = require("../middleware/auth.");
const router = express_1.default.Router();
router.get("/all", auth_1.authenticate, auth_1.isStaff, billsellDetail_controller_1.default.getAllBillSellDetails);
router.get("/order/:orderId", auth_1.authenticate, auth_1.isStaff, billsellDetail_controller_1.default.getBillSellDetailsByOrderId);
router.get("/:id", auth_1.authenticate, auth_1.isStaff, billsellDetail_controller_1.default.getBillSellDetailById);
router.post("/create", auth_1.authenticate, auth_1.isStaff, billsellDetail_controller_1.default.createBillSellDetail);
router.put("/:id", auth_1.authenticate, auth_1.isStaff, billsellDetail_controller_1.default.updateBillSellDetail);
router.delete("/:id", auth_1.authenticate, auth_1.isStaff, billsellDetail_controller_1.default.deleteBillSellDetail);
exports.default = router;
//# sourceMappingURL=bill.routes.js.map