"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const importProdcut_model_1 = __importDefault(require("../models/importProdcut.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
function serializeError(error) {
    if (error instanceof Error)
        return { message: error.message };
    return { message: String(error) };
}
class ImportController {
    async getAllImports(req, res) {
        try {
            const imports = await importProdcut_model_1.default.findAll({
                include: [{ model: user_model_1.default, as: "user", attributes: ["User_id", "Full_Name", "Email", "role"] }],
                order: [["Purchase_id", "DESC"]],
            });
            res.status(200).json({ success: true, data: imports });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to fetch import records",
                error: serializeError(error),
            });
        }
    }
    async getImportById(req, res) {
        try {
            const purchaseId = parseInt(String(req.params.id), 10);
            if (!Number.isInteger(purchaseId) || purchaseId < 1) {
                res.status(400).json({ success: false, message: "Invalid import ID" });
                return;
            }
            const record = await importProdcut_model_1.default.findByPk(purchaseId, {
                include: [{ model: user_model_1.default, as: "user", attributes: ["User_id", "Full_Name", "Email", "role"] }],
            });
            if (!record) {
                res.status(404).json({ success: false, message: "Import record not found" });
                return;
            }
            res.status(200).json({ success: true, data: record });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to fetch import record",
                error: serializeError(error),
            });
        }
    }
    async createImport(req, res) {
        try {
            const authUser = req.user;
            const user_id = req.body?.user_id !== undefined && req.body?.user_id !== ""
                ? String(req.body.user_id)
                : authUser?.id ?? null;
            if (user_id) {
                const user = await user_model_1.default.findByPk(user_id);
                if (!user) {
                    res.status(400).json({ success: false, message: "User not found for user_id" });
                    return;
                }
            }
            const record = await importProdcut_model_1.default.create({ user_id });
            res.status(201).json({ success: true, data: record });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to create import record",
                error: serializeError(error),
            });
        }
    }
    async updateImport(req, res) {
        try {
            const purchaseId = parseInt(String(req.params.id), 10);
            if (!Number.isInteger(purchaseId) || purchaseId < 1) {
                res.status(400).json({ success: false, message: "Invalid import ID" });
                return;
            }
            const record = await importProdcut_model_1.default.findByPk(purchaseId);
            if (!record) {
                res.status(404).json({ success: false, message: "Import record not found" });
                return;
            }
            const { user_id } = req.body ?? {};
            if (user_id !== undefined && user_id !== null && user_id !== "") {
                const user = await user_model_1.default.findByPk(String(user_id));
                if (!user) {
                    res.status(400).json({ success: false, message: "User not found for user_id" });
                    return;
                }
                await record.update({ user_id: String(user_id) });
            }
            else if (user_id === null || user_id === "") {
                await record.update({ user_id: null });
            }
            res.status(200).json({ success: true, data: record });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to update import record",
                error: serializeError(error),
            });
        }
    }
    async deleteImport(req, res) {
        try {
            const purchaseId = parseInt(String(req.params.id), 10);
            if (!Number.isInteger(purchaseId) || purchaseId < 1) {
                res.status(400).json({ success: false, message: "Invalid import ID" });
                return;
            }
            const record = await importProdcut_model_1.default.findByPk(purchaseId);
            if (!record) {
                res.status(404).json({ success: false, message: "Import record not found" });
                return;
            }
            await record.destroy();
            res
                .status(200)
                .json({ success: true, message: "Import record deleted successfully" });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to delete import record",
                error: serializeError(error),
            });
        }
    }
}
exports.default = new ImportController();
//# sourceMappingURL=import_controller.js.map