"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = __importDefault(require("../controller/user.controller"));
const auth_1 = require("../middleware/auth.");
const router = express_1.default.Router();
router.get("/all", auth_1.authenticate, auth_1.isStaff, user_controller_1.default.getAllUsers);
router.get("/me", auth_1.authenticate, user_controller_1.default.getCurrentUser);
router.put("/me", auth_1.authenticate, user_controller_1.default.updateProfile);
router.get("/:id", auth_1.authenticate, auth_1.isStaff, user_controller_1.default.getUserById);
router.post("/create", auth_1.authenticate, auth_1.isStaff, user_controller_1.default.createUser);
router.put("/:id", auth_1.authenticate, auth_1.isStaff, user_controller_1.default.updateUser);
router.delete("/:id", auth_1.authenticate, auth_1.isAdmin, user_controller_1.default.deleteUser);
exports.default = router;
//# sourceMappingURL=user.routes.js.map