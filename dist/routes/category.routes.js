"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const category_controller_1 = __importDefault(require("../controller/category.controller"));
const auth_1 = require("../middleware/auth.");
const router = express_1.default.Router();
router.get("/all", category_controller_1.default.getAllCategories);
router.get("/search", category_controller_1.default.searchCategories);
router.get("/:id", category_controller_1.default.getCategoryById);
router.get("/:id/products", category_controller_1.default.getProductsByCategory);
router.post("/create", auth_1.authenticate, auth_1.isStaff, category_controller_1.default.createCategory);
router.put("/:id", auth_1.authenticate, auth_1.isStaff, category_controller_1.default.updatecategory);
router.delete("/:id", auth_1.authenticate, auth_1.isStaff, category_controller_1.default.deleteCategory);
router.get("/stats/overview", auth_1.authenticate, auth_1.isStaff, category_controller_1.default.getCategoryStatsOverview);
exports.default = router;
//# sourceMappingURL=category.routes.js.map