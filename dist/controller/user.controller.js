"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = exports.createUser = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const createUser = async (req, res) => {
    try {
        const user = await user_model_1.default.create(req.body);
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.createUser = createUser;
const getUsers = async (_req, res) => {
    const users = await user_model_1.default.findAll();
    res.json(users);
};
exports.getUsers = getUsers;
//# sourceMappingURL=user.controller.js.map