"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/services/PaymentService.ts
const models_1 = require("../models");
const sequelize_1 = require("sequelize");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const StockService_1 = __importDefault(require("./StockService"));
const NotificationService_1 = __importDefault(require("./NotificationService"));
const EmailService_1 = __importDefault(require("./EmailService"));
class PaymentService {
    /**
     * Record a new payment for an order
     * @param orderId Order ID
     * @param paymentImage Path to payment receipt image
     */
    async recordPayment(orderId, paymentImage) {
        try {
            const order = await models_1.Order.findByPk(orderId);
            if (!order) {
                throw new Error(`Order with ID ${orderId} not found`);
            }
            if (order.payment_status === 'verified') {
                throw new Error('Payment already verified');
            }
            await order.update({
                payment_image: paymentImage,
                payment_status: 'pending'
            });
            await NotificationService_1.default.notifyAdmin('new_payment', {
                orderId: order.order_id,
                amount: order.price,
                date: new Date()
            });
            return true;
        }
        catch (error) {
            console.error('Error recording payment:', error);
            return false;
        }
    }
    /**
     * Verify a payment
     * @param orderId Order ID
     * @param status Verification status ('verified' or 'rejected')
     * @param adminId Admin user ID
     */
    async verifyPayment(orderId, status, adminId) {
        const transaction = await models_1.sequelize.transaction();
        try {
            const order = await models_1.Order.findByPk(orderId, {
                transaction,
                include: [{
                        association: 'customer'
                    }]
            });
            if (!order) {
                await transaction.rollback();
                throw new Error(`Order with ID ${orderId} not found`);
            }
            if (order.payment_status === status) {
                await transaction.rollback();
                throw new Error(`Payment already ${status}`);
            }
            if (status === 'verified') {
                const stockUpdated = await StockService_1.default.reduceStock(orderId, transaction);
                if (!stockUpdated) {
                    await transaction.rollback();
                    throw new Error('Failed to update stock');
                }
                await order.update({
                    payment_status: status,
                    shipping_status: 'processing'
                }, { transaction });
                if (order.customer && order.customer.cus_name) {
                    await EmailService_1.default.sendPaymentConfirmation(order);
                }
            }
            else if (status === 'rejected') {
                await order.update({
                    payment_status: status,
                    shipping_status: 'cancelled'
                }, { transaction });
                if (order.customer && order.customer.cus_name) {
                    await EmailService_1.default.sendPaymentRejection(order);
                }
            }
            console.log(`Payment for order ${orderId} ${status} by admin ${adminId}`);
            await transaction.commit();
            await NotificationService_1.default.notifyCustomer('payment_status', {
                orderId: order.order_id,
                status: status,
                date: new Date()
            });
            return true;
        }
        catch (error) {
            await transaction.rollback();
            console.error('Error verifying payment:', error);
            return false;
        }
    }
    /**
     * Get payment receipt file path
     * @param orderId Order ID
     */
    async getPaymentReceipt(orderId) {
        try {
            const order = await models_1.Order.findByPk(orderId);
            if (!order || !order.payment_image) {
                return null;
            }
            const filePath = path_1.default.join(__dirname, '../../public', order.payment_image);
            if (!fs_1.default.existsSync(filePath)) {
                return null;
            }
            return order.payment_image;
        }
        catch (error) {
            console.error('Error getting payment receipt:', error);
            return null;
        }
    }
    /**
     * Calculate payment statistics
     */
    async getPaymentStats() {
        try {
            const pendingPayments = await models_1.Order.count({
                where: { payment_status: 'pending' }
            });
            const verifiedPayments = await models_1.Order.count({
                where: { payment_status: 'verified' }
            });
            const rejectedPayments = await models_1.Order.count({
                where: { payment_status: 'rejected' }
            });
            const totalRevenue = await models_1.Order.sum('price', {
                where: { payment_status: 'verified' }
            });
            const todayStr = new Date().toISOString().slice(0, 10);
            const todayRevenue = await models_1.Order.sum('price', {
                where: {
                    payment_status: 'verified',
                    date: { [sequelize_1.Op.eq]: todayStr }
                }
            });
            return {
                payments: {
                    pending: pendingPayments,
                    verified: verifiedPayments,
                    rejected: rejectedPayments
                },
                revenue: {
                    total: totalRevenue || 0,
                    today: todayRevenue || 0
                }
            };
        }
        catch (error) {
            console.error('Error calculating payment stats:', error);
            return {
                payments: {
                    pending: 0,
                    verified: 0,
                    rejected: 0
                },
                revenue: {
                    total: 0,
                    today: 0
                }
            };
        }
    }
}
exports.default = new PaymentService();
//# sourceMappingURL=PaymentService.js.map