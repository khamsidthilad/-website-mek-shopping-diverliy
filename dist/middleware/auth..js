"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOwnCustomer = exports.isCustomer = exports.isStaff = exports.isAdmin = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user.model"));
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                success: false,
                message: "Authentication required. No token provided.",
            });
            return;
        }
        const token = authHeader.split(" ")[1];
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
        const user = await user_model_1.default.findByPk(decoded.id);
        if (!user) {
            res.status(401).json({
                success: false,
                message: "Invalid token. User not found.",
            });
            return;
        }
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: "Authentication failed. Invalid token.",
        });
    }
};
exports.authenticate = authenticate;
const isAdmin = (req, res, next) => {
    const user = req.user;
    if (!user || user.role !== "admin") {
        res.status(403).json({
            success: false,
            message: "Access denied. Admin authorization required.",
        });
        return;
    }
    next();
};
exports.isAdmin = isAdmin;
const isStaff = (req, res, next) => {
    const user = req.user;
    if (!user || (user.role !== "admin" && user.role !== "staff")) {
        res.status(403).json({
            success: false,
            message: "Access denied. Staff authorization required.",
        });
        return;
    }
    next();
};
exports.isStaff = isStaff;
const isCustomer = (req, res, next) => {
    const user = req.user;
    if (!user || user.role !== "customer") {
        res.status(403).json({
            success: false,
            message: "Access denied. Customer authorization required.",
        });
        return;
    }
    next();
};
exports.isCustomer = isCustomer;
const isOwnCustomer = (req, res, next) => {
    const user = req.user;
    const customerIdParam = req.params.customerId ?? req.params.id;
    const customerIdStr = Array.isArray(customerIdParam)
        ? customerIdParam[0]
        : customerIdParam;
    if (!customerIdStr) {
        res.status(400).json({
            success: false,
            message: "Customer ID parameter is required.",
        });
        return;
    }
    const customerId = parseInt(customerIdStr, 10);
    if (isNaN(customerId)) {
        console.log("customerId is not a valid number:", customerIdStr);
        res.status(400).json({
            success: false,
            message: "Invalid customer ID format.",
        });
        return;
    }
    if (!user) {
        console.log("Authorization failed: No user found");
        res.status(403).json({
            success: false,
            message: "Access denied. User not authenticated.",
        });
        return;
    }
    if (user.role === "customer" && user.customerId !== customerId) {
        res.status(403).json({
            success: false,
            message: "Access denied. You can only access your own data.",
        });
        return;
    }
    next();
};
exports.isOwnCustomer = isOwnCustomer;
//# sourceMappingURL=auth..js.map