"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const importProdcut_model_1 = __importDefault(require("../models/importProdcut.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const product_model_1 = __importDefault(require("../models/product.model"));
const supplier_model_1 = __importDefault(require("../models/supplier.model"));
const models_1 = require("../models");
function serializeError(error) {
    if (error instanceof Error)
        return { message: error.message };
    return { message: String(error) };
}
function toNumber(value) {
    if (value == null || value === '')
        return 0;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}
const importIncludes = [
    { model: user_model_1.default, as: 'user', attributes: ['User_id', 'Full_Name', 'Email', 'role'] },
    { model: product_model_1.default, as: 'product' },
    { model: supplier_model_1.default, as: 'supplier' },
];
class ImportController {
    async getAllImports(req, res) {
        try {
            const imports = await importProdcut_model_1.default.findAll({
                include: importIncludes,
                order: [['Purchase_id', 'DESC']],
            });
            res.status(200).json({ success: true, data: imports });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch import records',
                error: serializeError(error),
            });
        }
    }
    async getImportById(req, res) {
        try {
            const purchaseId = parseInt(String(req.params.id), 10);
            if (!Number.isInteger(purchaseId) || purchaseId < 1) {
                res.status(400).json({ success: false, message: 'Invalid import ID' });
                return;
            }
            const record = await importProdcut_model_1.default.findByPk(purchaseId, { include: importIncludes });
            if (!record) {
                res.status(404).json({ success: false, message: 'Import record not found' });
                return;
            }
            res.status(200).json({ success: true, data: record });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch import record',
                error: serializeError(error),
            });
        }
    }
    async createImport(req, res) {
        const transaction = await models_1.sequelize.transaction();
        try {
            const authUser = req.user;
            const pro_id = parseInt(String(req.body?.pro_id), 10);
            const sup_id = parseInt(String(req.body?.sup_id), 10);
            const quantity = parseInt(String(req.body?.quantity), 10);
            const price = toNumber(req.body?.cost_price);
            if (!Number.isInteger(pro_id) || pro_id < 1) {
                await transaction.rollback();
                res.status(400).json({ success: false, message: 'A valid product is required' });
                return;
            }
            if (!Number.isInteger(sup_id) || sup_id < 1) {
                await transaction.rollback();
                res.status(400).json({ success: false, message: 'A valid supplier is required' });
                return;
            }
            if (!Number.isInteger(quantity) || quantity < 1) {
                await transaction.rollback();
                res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
                return;
            }
            if (price < 0) {
                await transaction.rollback();
                res.status(400).json({ success: false, message: 'Cost price cannot be negative' });
                return;
            }
            const product = await product_model_1.default.findByPk(pro_id, { transaction });
            if (!product) {
                await transaction.rollback();
                res.status(404).json({ success: false, message: 'Product not found' });
                return;
            }
            const supplier = await supplier_model_1.default.findByPk(sup_id, { transaction });
            if (!supplier) {
                await transaction.rollback();
                res.status(404).json({ success: false, message: 'Supplier not found' });
                return;
            }
            const user_id = authUser?.id ?? null;
            if (user_id) {
                const user = await user_model_1.default.findByPk(user_id, { transaction });
                if (!user) {
                    await transaction.rollback();
                    res.status(400).json({ success: false, message: 'User not found for user_id' });
                    return;
                }
            }
            const record = await importProdcut_model_1.default.create({
                user_id,
                pro_id,
                sup_id,
                quantity,
                price,
            }, { transaction });
            await product.update({ pro_qty: (product.pro_qty ?? 0) + quantity }, { transaction });
            await transaction.commit();
            const created = await importProdcut_model_1.default.findByPk(record.Purchase_id, { include: importIncludes });
            res.status(201).json({ success: true, data: created });
        }
        catch (error) {
            await transaction.rollback();
            res.status(500).json({
                success: false,
                message: 'Failed to create import record',
                error: serializeError(error),
            });
        }
    }
    async updateImport(req, res) {
        const transaction = await models_1.sequelize.transaction();
        try {
            const purchaseId = parseInt(String(req.params.id), 10);
            if (!Number.isInteger(purchaseId) || purchaseId < 1) {
                await transaction.rollback();
                res.status(400).json({ success: false, message: 'Invalid import ID' });
                return;
            }
            const record = await importProdcut_model_1.default.findByPk(purchaseId, { transaction });
            if (!record) {
                await transaction.rollback();
                res.status(404).json({ success: false, message: 'Import record not found' });
                return;
            }
            const nextProId = req.body?.pro_id !== undefined ? parseInt(String(req.body.pro_id), 10) : record.pro_id;
            const nextSupId = req.body?.sup_id !== undefined ? parseInt(String(req.body.sup_id), 10) : record.sup_id;
            const nextQuantity = req.body?.quantity !== undefined
                ? parseInt(String(req.body.quantity), 10)
                : (record.quantity ?? 0);
            const nextPrice = req.body?.cost_price !== undefined ? toNumber(req.body.cost_price) : toNumber(record.price);
            if (nextProId == null || !Number.isInteger(nextProId) || nextProId < 1) {
                await transaction.rollback();
                res.status(400).json({ success: false, message: 'A valid product is required' });
                return;
            }
            if (nextSupId == null || !Number.isInteger(nextSupId) || nextSupId < 1) {
                await transaction.rollback();
                res.status(400).json({ success: false, message: 'A valid supplier is required' });
                return;
            }
            if (!Number.isInteger(nextQuantity) || nextQuantity < 1) {
                await transaction.rollback();
                res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
                return;
            }
            if (nextPrice < 0) {
                await transaction.rollback();
                res.status(400).json({ success: false, message: 'Cost price cannot be negative' });
                return;
            }
            const oldProduct = record.pro_id
                ? await product_model_1.default.findByPk(record.pro_id, { transaction })
                : null;
            const newProduct = await product_model_1.default.findByPk(nextProId, { transaction });
            if (!newProduct) {
                await transaction.rollback();
                res.status(404).json({ success: false, message: 'Product not found' });
                return;
            }
            const supplier = await supplier_model_1.default.findByPk(nextSupId, { transaction });
            if (!supplier) {
                await transaction.rollback();
                res.status(404).json({ success: false, message: 'Supplier not found' });
                return;
            }
            const oldQuantity = record.quantity ?? 0;
            if (oldProduct && record.pro_id === nextProId) {
                const stockDelta = nextQuantity - oldQuantity;
                const currentStock = oldProduct.pro_qty ?? 0;
                if (currentStock + stockDelta < 0) {
                    await transaction.rollback();
                    res.status(400).json({
                        success: false,
                        message: 'Cannot reduce stock below zero for this product',
                    });
                    return;
                }
                await oldProduct.update({ pro_qty: currentStock + stockDelta }, { transaction });
            }
            else {
                if (oldProduct) {
                    await oldProduct.update({ pro_qty: Math.max(0, (oldProduct.pro_qty ?? 0) - oldQuantity) }, { transaction });
                }
                await newProduct.update({ pro_qty: (newProduct.pro_qty ?? 0) + nextQuantity }, { transaction });
            }
            await record.update({
                pro_id: nextProId,
                sup_id: nextSupId,
                quantity: nextQuantity,
                price: nextPrice,
            }, { transaction });
            await transaction.commit();
            const updated = await importProdcut_model_1.default.findByPk(record.Purchase_id, { include: importIncludes });
            res.status(200).json({ success: true, data: updated });
        }
        catch (error) {
            await transaction.rollback();
            res.status(500).json({
                success: false,
                message: 'Failed to update import record',
                error: serializeError(error),
            });
        }
    }
    async deleteImport(req, res) {
        const transaction = await models_1.sequelize.transaction();
        try {
            const purchaseId = parseInt(String(req.params.id), 10);
            if (!Number.isInteger(purchaseId) || purchaseId < 1) {
                await transaction.rollback();
                res.status(400).json({ success: false, message: 'Invalid import ID' });
                return;
            }
            const record = await importProdcut_model_1.default.findByPk(purchaseId, { transaction });
            if (!record) {
                await transaction.rollback();
                res.status(404).json({ success: false, message: 'Import record not found' });
                return;
            }
            if (record.pro_id && (record.quantity ?? 0) > 0) {
                const product = await product_model_1.default.findByPk(record.pro_id, { transaction });
                if (product) {
                    const nextQty = Math.max(0, (product.pro_qty ?? 0) - (record.quantity ?? 0));
                    await product.update({ pro_qty: nextQty }, { transaction });
                }
            }
            await record.destroy({ transaction });
            await transaction.commit();
            res.status(200).json({ success: true, message: 'Import record deleted successfully' });
        }
        catch (error) {
            await transaction.rollback();
            res.status(500).json({
                success: false,
                message: 'Failed to delete import record',
                error: serializeError(error),
            });
        }
    }
}
exports.default = new ImportController();
//# sourceMappingURL=import_controller.js.map