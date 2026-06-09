"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const contact_controller_1 = __importDefault(require("../controller/contact.controller"));
const router = express_1.default.Router();
router.get('/info', contact_controller_1.default.getInfo);
router.post('/', contact_controller_1.default.submitMessage);
exports.default = router;
//# sourceMappingURL=contact.routes.js.map