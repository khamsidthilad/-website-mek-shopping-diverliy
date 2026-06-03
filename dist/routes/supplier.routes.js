"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supplier_controller_1 = __importDefault(require("../controller/supplier.controller"));
const auth_1 = require("../middleware/auth.");
const router = express_1.default.Router();
router.get("/all", auth_1.authenticate, auth_1.isStaff, supplier_controller_1.default.getAllSuppliers);
router.get("/:id", auth_1.authenticate, auth_1.isStaff, supplier_controller_1.default.getSupplierById);
router.post("/create", auth_1.authenticate, auth_1.isStaff, supplier_controller_1.default.createSupplier);
router.put("/:id", auth_1.authenticate, auth_1.isStaff, supplier_controller_1.default.updateSupplier);
router.delete("/:id", auth_1.authenticate, auth_1.isStaff, supplier_controller_1.default.deleteSupplier);
exports.default = router;
//# sourceMappingURL=supplier.routes.js.map