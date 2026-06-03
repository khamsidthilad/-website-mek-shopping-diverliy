"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const billSellDetail_model_1 = __importDefault(require("../models/billSellDetail.model"));
const product_model_1 = __importDefault(require("../models/product.model"));
const order_model_1 = __importDefault(require("../models/order.model"));
function serializeError(error) {
    if (error instanceof Error) {
        const anyErr = error;
        const parts = [
            anyErr.message,
            anyErr.parent?.message,
            anyErr.errors
                ?.map((e) => e.message)
                .filter(Boolean)
                .join("; "),
        ].filter(Boolean);
        return {
            message: parts[0] || "Error",
            details: anyErr.errors?.length
                ? anyErr.errors
                : anyErr.parent?.message
                    ? { sqlMessage: anyErr.parent.message }
                    : undefined,
        };
    }
    return { message: String(error) };
}
class BillSellDetailController {
    async getAllBillSellDetails(req, res) {
        try {
            const details = await billSellDetail_model_1.default.findAll({
                include: [
                    { model: product_model_1.default, as: "product" },
                    { model: order_model_1.default, as: "order" },
                ],
                order: [["detail_id", "DESC"]],
            });
            res.status(200).json({
                success: true,
                data: details,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to fetch bill sell details",
                error: serializeError(error),
            });
        }
    }
    async getBillSellDetailById(req, res) {
        try {
            const rawId = req.params.id;
            const detailId = parseInt(rawId, 10);
            if (!Number.isInteger(detailId) || detailId < 1) {
                res.status(400).json({
                    success: false,
                    message: "Invalid detail ID",
                });
                return;
            }
            const detail = await billSellDetail_model_1.default.findByPk(detailId, {
                include: [
                    { model: product_model_1.default, as: "product" },
                    { model: order_model_1.default, as: "order" },
                ],
            });
            if (!detail) {
                res.status(404).json({
                    success: false,
                    message: "Bill sell detail not found",
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: detail,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to fetch bill sell detail",
                error: serializeError(error),
            });
        }
    }
    async getBillSellDetailsByOrderId(req, res) {
        try {
            const raw = req.params.orderId ?? req.params.id;
            const orderId = parseInt(String(raw), 10);
            if (!Number.isInteger(orderId) || orderId < 1) {
                res.status(400).json({
                    success: false,
                    message: "Invalid order ID",
                });
                return;
            }
            const details = await billSellDetail_model_1.default.findAll({
                where: { Order_id: orderId },
                include: [{ model: product_model_1.default, as: "product" }],
                order: [["detail_id", "ASC"]],
            });
            res.status(200).json({
                success: true,
                data: details,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to fetch bill sell details for order",
                error: serializeError(error),
            });
        }
    }
    async createBillSellDetail(req, res) {
        try {
            const { Order_id, Pro_id, qty, Total, date, image } = req.body ?? {};
            const created = await billSellDetail_model_1.default.create({
                Order_id: Order_id ?? null,
                Pro_id: Pro_id ?? null,
                qty: qty ?? null,
                Total: Total ?? null,
                date: date ?? null,
                image: image ?? null,
            });
            res.status(201).json({
                success: true,
                data: created,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to create bill sell detail",
                error: serializeError(error),
            });
        }
    }
    async updateBillSellDetail(req, res) {
        try {
            const rawId = req.params.id;
            const detailId = parseInt(rawId, 10);
            if (!Number.isInteger(detailId) || detailId < 1) {
                res.status(400).json({
                    success: false,
                    message: "Invalid detail ID",
                });
                return;
            }
            const detail = await billSellDetail_model_1.default.findByPk(detailId);
            if (!detail) {
                res.status(404).json({
                    success: false,
                    message: "Bill sell detail not found",
                });
                return;
            }
            const { Order_id, Pro_id, qty, Total, date, image } = req.body ?? {};
            await detail.update({
                Order_id: Order_id ?? detail.Order_id,
                Pro_id: Pro_id ?? detail.Pro_id,
                qty: qty ?? detail.qty,
                Total: Total ?? detail.Total,
                date: date ?? detail.date,
                image: image ?? detail.image,
            });
            res.status(200).json({
                success: true,
                data: detail,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to update bill sell detail",
                error: serializeError(error),
            });
        }
    }
    async deleteBillSellDetail(req, res) {
        try {
            const rawId = req.params.id;
            const detailId = parseInt(rawId, 10);
            if (!Number.isInteger(detailId) || detailId < 1) {
                res.status(400).json({
                    success: false,
                    message: "Invalid detail ID",
                });
                return;
            }
            const detail = await billSellDetail_model_1.default.findByPk(detailId);
            if (!detail) {
                res.status(404).json({
                    success: false,
                    message: "Bill sell detail not found",
                });
                return;
            }
            await detail.destroy();
            res.status(200).json({
                success: true,
                message: "Bill sell detail deleted successfully",
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to delete bill sell detail",
                error: serializeError(error),
            });
        }
    }
}
exports.default = new BillSellDetailController();
//# sourceMappingURL=billsellDetail.controller.js.map