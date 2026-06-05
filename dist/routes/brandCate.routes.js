"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const brandCate_controller_1 = __importDefault(require("../controller/brandCate.controller"));
const auth_1 = require("../middleware/auth.");
const router = express_1.default.Router();
router.get("/all", auth_1.authenticate, auth_1.isStaff, brandCate_controller_1.default.getAllLinks);
router.get("/brand/:brandId", auth_1.authenticate, auth_1.isStaff, brandCate_controller_1.default.getLinksByBrand);
router.get("/category/:cateId", auth_1.authenticate, auth_1.isStaff, brandCate_controller_1.default.getLinksByCategory);
router.post("/create", auth_1.authenticate, auth_1.isStaff, brandCate_controller_1.default.createLink);
router.put("/brand/:brandId", auth_1.authenticate, auth_1.isStaff, brandCate_controller_1.default.setBrandCategories);
router.delete("/:brandId/:cateId", auth_1.authenticate, auth_1.isStaff, brandCate_controller_1.default.deleteLink);
exports.default = router;
//# sourceMappingURL=brandCate.routes.js.map