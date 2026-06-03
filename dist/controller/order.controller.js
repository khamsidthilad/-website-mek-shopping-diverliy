"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const product_model_1 = __importDefault(require("../models/product.model"));
const db_1 = require("../config/db");
const customer_model_1 = __importDefault(require("../models/customer.model"));
const order_model_1 = __importDefault(require("../models/order.model"));
const billSellDetail_model_1 = __importDefault(require("../models/billSellDetail.model"));
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
class OrderController {
    async createOrder(req, res) {
        const transaction = await db_1.sequelize.transaction();
        try {
            const user = req.user;
            const customerId = user?.customerId;
            if (customerId == null || !Number.isInteger(customerId)) {
                await transaction.rollback();
                res.status(403).json({
                    success: false,
                    message: "Customer profile not linked to this account (customerId missing from token).",
                });
                return;
            }
            const rawItems = req.body?.items;
            if (!Array.isArray(rawItems) || rawItems.length === 0) {
                await transaction.rollback();
                res.status(400).json({
                    success: false,
                    message: 'Body must include a non-empty "items" array ({ productId or pro_id, quantity }).',
                });
                return;
            }
            const customer = await customer_model_1.default.findByPk(customerId, { transaction });
            if (!customer) {
                await transaction.rollback();
                res.status(404).json({
                    success: false,
                    message: "Customer not found",
                });
                return;
            }
            const lines = [];
            for (const row of rawItems) {
                if (row == null || typeof row !== "object") {
                    await transaction.rollback();
                    res.status(400).json({
                        success: false,
                        message: "Each item must be an object.",
                    });
                    return;
                }
                const rec = row;
                const rawId = rec.productId ?? rec.pro_id;
                const productId = typeof rawId === "string" ? parseInt(rawId, 10) : Number(rawId);
                const quantity = Math.floor(Number(rec.quantity != null ? rec.quantity : 1));
                if (!Number.isInteger(productId) ||
                    productId < 1 ||
                    !Number.isInteger(quantity) ||
                    quantity < 1) {
                    await transaction.rollback();
                    res.status(400).json({
                        success: false,
                        message: "Each item needs a valid productId (or pro_id) and quantity >= 1.",
                    });
                    return;
                }
                const product = await product_model_1.default.findByPk(productId, { transaction });
                if (!product) {
                    await transaction.rollback();
                    res.status(404).json({
                        success: false,
                        message: `Product with ID ${productId} not found`,
                    });
                    return;
                }
                const unit = Number(product.pro_price);
                if (!Number.isFinite(unit) || unit < 0) {
                    await transaction.rollback();
                    res.status(400).json({
                        success: false,
                        message: `Product "${product.pro_name ?? productId}" has no valid price`,
                    });
                    return;
                }
                const stock = product.pro_qty ?? 0;
                if (stock < quantity) {
                    await transaction.rollback();
                    res.status(400).json({
                        success: false,
                        message: `Insufficient stock for product ${product.pro_name}`,
                    });
                    return;
                }
                lines.push({
                    productId,
                    quantity,
                    unitPrice: unit,
                    image: product.pro_image ?? null,
                });
            }
            const totalPrice = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
            const newOrder = await order_model_1.default.create({
                cus_id: customerId,
                pro_id: lines[0].productId,
                price: Math.round(Number(totalPrice)),
                date: new Date(),
                payment_status: "pending",
                shipping_status: "waiting",
            }, { transaction });
            for (const line of lines) {
                await billSellDetail_model_1.default.create({
                    Order_id: newOrder.order_id,
                    Pro_id: line.productId,
                    qty: line.quantity,
                    Total: Math.round(line.unitPrice * line.quantity),
                    date: newOrder.date ?? new Date(),
                    image: line.image,
                }, { transaction });
            }
            await transaction.commit();
            res.status(201).json({
                success: true,
                message: "Order created successfully",
                data: {
                    orderId: newOrder.order_id,
                    totalPrice: Math.round(Number(totalPrice)),
                },
            });
        }
        catch (error) {
            await transaction.rollback().catch(() => { });
            const { message, details } = serializeError(error);
            console.error("[createOrder]", error);
            res.status(500).json({
                success: false,
                message: "Failed to create order",
                error: { message, ...(details ? { details } : {}) },
            });
        }
    }
    async getOrderDetails(req, res) {
        try {
            const raw = req.params.orderId ??
                req.params.id;
            const orderId = parseInt(String(raw), 10);
            if (!Number.isInteger(orderId) || orderId < 1) {
                res.status(400).json({
                    success: false,
                    message: "Invalid order ID",
                });
                return;
            }
            const order = await order_model_1.default.findByPk(orderId, {
                include: [
                    {
                        model: customer_model_1.default,
                        as: "customer",
                    },
                    {
                        model: billSellDetail_model_1.default,
                        as: "billDetails",
                        include: [
                            {
                                model: product_model_1.default,
                                as: "product",
                            },
                        ],
                    },
                ],
            });
            if (!order) {
                res.status(404).json({
                    success: false,
                    message: "Order not found",
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: order,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to retrieve order details",
                error: serializeError(error),
            });
        }
    }
    async uploadPaymentReceipt(req, res) {
        try {
            const raw = req.params.orderId ??
                req.params.id;
            const orderId = parseInt(String(raw), 10);
            if (!Number.isInteger(orderId) || orderId < 1) {
                res.status(400).json({
                    success: false,
                    message: "Invalid order ID",
                });
                return;
            }
            const order = await order_model_1.default.findByPk(orderId);
            if (!order) {
                res.status(404).json({
                    success: false,
                    message: "Order not found",
                });
                return;
            }
            if (order.payment_status === "verified") {
                res.status(400).json({
                    success: false,
                    message: "Payment already verified",
                });
                return;
            }
            let paymentImage = null;
            if (req.file) {
                paymentImage = `/uploads/payments/${req.file.filename}`;
            }
            else {
                res.status(400).json({
                    success: false,
                    message: "Payment receipt file is required",
                });
                return;
            }
            await order.update({
                payment_image: paymentImage,
                payment_status: "pending",
            });
            res.status(200).json({
                success: true,
                message: "Payment receipt uploaded successfully",
                data: {
                    orderId: order.order_id,
                    paymentStatus: order.payment_status,
                },
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to upload payment receipt",
                error: serializeError(error),
            });
        }
    }
    async getReportOrder(req, res) {
        try {
            const orders = await order_model_1.default.findAll({
                include: [
                    {
                        model: customer_model_1.default,
                        as: "customer",
                    },
                    {
                        model: billSellDetail_model_1.default,
                        as: "billDetails",
                        include: [
                            {
                                model: product_model_1.default,
                                as: "product",
                            },
                        ],
                    },
                ],
                order: [["date", "DESC"]],
            });
            res.status(200).json({
                success: true,
                data: orders,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to generate order report",
                error: serializeError(error),
            });
        }
    }
    async getCustomerOrders(req, res) {
        try {
            const raw = req.params.customerId ??
                req.params.id;
            const customerId = parseInt(String(raw), 10);
            if (!Number.isInteger(customerId) || customerId < 1) {
                res.status(400).json({
                    success: false,
                    message: "Invalid customer ID",
                });
                return;
            }
            const orders = await order_model_1.default.findAll({
                where: {
                    cus_id: customerId,
                },
                include: [
                    {
                        model: billSellDetail_model_1.default,
                        as: "billDetails",
                        include: [
                            {
                                model: product_model_1.default,
                                as: "product",
                            },
                        ],
                    },
                ],
                order: [["date", "DESC"]],
            });
            res.status(200).json({
                success: true,
                data: orders,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to fetch customer orders",
                error,
            });
        }
    }
    async updateOrderStatus(req, res) {
        try {
            const raw = req.params.orderId ??
                req.params.id;
            const orderId = parseInt(String(raw), 10);
            if (!Number.isInteger(orderId) || orderId < 1) {
                res.status(400).json({
                    success: false,
                    message: "Invalid order ID",
                });
                return;
            }
            const statusRaw = req.body?.status;
            const status = typeof statusRaw === "string" ? statusRaw.trim() : "";
            const allowed = new Set([
                "waiting",
                "processing",
                "shipped",
                "delivered",
                "cancelled",
            ]);
            if (!allowed.has(status)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid status. Allowed: "waiting", "processing", "shipped", "delivered", "cancelled".',
                });
                return;
            }
            const order = await order_model_1.default.findByPk(orderId);
            if (!order) {
                res.status(404).json({
                    success: false,
                    message: "Order not found",
                });
                return;
            }
            await order.update({ shipping_status: status });
            res.status(200).json({
                success: true,
                message: "Order status updated successfully",
                data: order,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to update order status",
                error: serializeError(error),
            });
        }
    }
}
exports.default = new OrderController();
//# sourceMappingURL=order.controller.js.map