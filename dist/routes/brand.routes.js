"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const brand_controller_1 = __importDefault(require("../controller/brand.controller"));
const auth_1 = require("../middleware/auth.");
const upload_1 = require("../middleware/upload");
const router = express_1.default.Router();
router.get("/all", auth_1.authenticate, auth_1.isStaff, brand_controller_1.default.getAllBrands);
router.get("/:id", auth_1.authenticate, auth_1.isStaff, brand_controller_1.default.getBrandById);
router.post("/create", auth_1.authenticate, auth_1.isStaff, upload_1.uploadBrandLogo, upload_1.handleUploadError, brand_controller_1.default.createBrand);
router.put("/:id", auth_1.authenticate, auth_1.isStaff, upload_1.uploadBrandLogo, upload_1.handleUploadError, brand_controller_1.default.updateBrand);
router.delete("/:id", auth_1.authenticate, auth_1.isStaff, brand_controller_1.default.deleteBrand);
exports.default = router;
//# sourceMappingURL=brand.routes.js.map