"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supplier_model_1 = __importDefault(require("../models/supplier.model"));
const product_model_1 = __importDefault(require("../models/product.model"));
function serializeError(error) {
    if (error instanceof Error)
        return { message: error.message };
    return { message: String(error) };
}
class SupplierController {
    async getAllSuppliers(req, res) {
        try {
            const suppliers = await supplier_model_1.default.findAll({
                include: [{ model: product_model_1.default, as: "product" }],
                order: [["sup_id", "DESC"]],
            });
            res.status(200).json({ success: true, data: suppliers });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to fetch suppliers",
                error: serializeError(error),
            });
        }
    }
    async getSupplierById(req, res) {
        try {
            const supplierId = parseInt(String(req.params.id), 10);
            if (!Number.isInteger(supplierId) || supplierId < 1) {
                res.status(400).json({ success: false, message: "Invalid supplier ID" });
                return;
            }
            const supplier = await supplier_model_1.default.findByPk(supplierId, {
                include: [{ model: product_model_1.default, as: "product" }],
            });
            if (!supplier) {
                res.status(404).json({ success: false, message: "Supplier not found" });
                return;
            }
            res.status(200).json({ success: true, data: supplier });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to fetch supplier",
                error: serializeError(error),
            });
        }
    }
    async createSupplier(req, res) {
        try {
            const { name, Tel, address, pro_id } = req.body ?? {};
            const supplier = await supplier_model_1.default.create({
                name: name ?? null,
                Tel: Tel ?? null,
                address: address ?? null,
                pro_id: pro_id ?? null,
            });
            res.status(201).json({ success: true, data: supplier });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to create supplier",
                error: serializeError(error),
            });
        }
    }
    async updateSupplier(req, res) {
        try {
            const supplierId = parseInt(String(req.params.id), 10);
            if (!Number.isInteger(supplierId) || supplierId < 1) {
                res.status(400).json({ success: false, message: "Invalid supplier ID" });
                return;
            }
            const supplier = await supplier_model_1.default.findByPk(supplierId);
            if (!supplier) {
                res.status(404).json({ success: false, message: "Supplier not found" });
                return;
            }
            const { name, Tel, address, pro_id } = req.body ?? {};
            await supplier.update({
                name: name ?? supplier.name,
                Tel: Tel ?? supplier.Tel,
                address: address ?? supplier.address,
                pro_id: pro_id ?? supplier.pro_id,
            });
            res.status(200).json({ success: true, data: supplier });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to update supplier",
                error: serializeError(error),
            });
        }
    }
    async deleteSupplier(req, res) {
        try {
            const supplierId = parseInt(String(req.params.id), 10);
            if (!Number.isInteger(supplierId) || supplierId < 1) {
                res.status(400).json({ success: false, message: "Invalid supplier ID" });
                return;
            }
            const supplier = await supplier_model_1.default.findByPk(supplierId);
            if (!supplier) {
                res.status(404).json({ success: false, message: "Supplier not found" });
                return;
            }
            await supplier.destroy();
            res
                .status(200)
                .json({ success: true, message: "Supplier deleted successfully" });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to delete supplier",
                error: serializeError(error),
            });
        }
    }
}
exports.default = new SupplierController();
//# sourceMappingURL=supplier.controller.js.map