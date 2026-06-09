"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const product_controller_1 = __importDefault(require("../controller/product.controller"));
const auth_1 = require("../middleware/auth.");
const upload_1 = require("../middleware/upload");
const router = express_1.default.Router();
router.get("/all", product_controller_1.default.getAllProducts);
router.get("/search/:term", product_controller_1.default.searchProducts);
router.get("/:id", product_controller_1.default.getProductById);
router.post("/create", auth_1.authenticate, auth_1.isStaff, upload_1.uploadProductImage, upload_1.handleUploadError, product_controller_1.default.createProduct);
router.put("/update/:id", upload_1.uploadProductImage, upload_1.handleUploadError, product_controller_1.default.updateProduct);
router.delete("/delete/:id", product_controller_1.default.deleteProduct);
exports.default = router;
//# sourceMappingURL=product.routes.js.map