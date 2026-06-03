"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const import_controller_1 = __importDefault(require("../controller/import_controller"));
const auth_1 = require("../middleware/auth.");
const router = express_1.default.Router();
router.get("/all", auth_1.authenticate, auth_1.isStaff, import_controller_1.default.getAllImports);
router.get("/:id", auth_1.authenticate, auth_1.isStaff, import_controller_1.default.getImportById);
router.post("/create", auth_1.authenticate, auth_1.isStaff, import_controller_1.default.createImport);
router.put("/:id", auth_1.authenticate, auth_1.isStaff, import_controller_1.default.updateImport);
router.delete("/:id", auth_1.authenticate, auth_1.isStaff, import_controller_1.default.deleteImport);
exports.default = router;
//# sourceMappingURL=import.routes.js.map