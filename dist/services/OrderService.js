"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/services/OrderService.ts
const models_1 = require("../models");
const sequelize_1 = require("sequelize");
const StockService_1 = __importDefault(require("./StockService"));
const EmailService_1 = __importDefault(require("./EmailService"));
const NotificationService_1 = __importDefault(require("./NotificationService"));
class OrderService {
    /**
     * Create a new order
     * @param orderData Order data
     */
    async createOrder(orderData) {
        // Start a transaction
        const transaction = await models_1.sequelize.transaction();
        try {
            const { customerId, items, totalPrice, shippingAddress, shippingNote } = orderData;
            const customer = await models_1.Customer.findByPk(customerId);
            if (!customer) {
                await transaction.rollback();
                throw new Error('Customer not found');
            }
            const stockOK = await StockService_1.default.checkStock(items);
            if (!stockOK) {
                await transaction.rollback();
                throw new Error('One or more products are out of stock');
            }
            const newOrder = await models_1.Order.create({
                cus_id: customerId,
                pro_id: items[0]?.productId ?? null,
                price: Math.round(Number(totalPrice)),
                date: new Date(),
                payment_status: 'pending',
                shipping_status: 'waiting'
            }, { transaction });
            for (const item of items) {
                const product = await models_1.Product.findByPk(item.productId);
                if (!product) {
                    await transaction.rollback();
                    throw new Error(`Product with ID ${item.productId} not found`);
                }
                await models_1.BillSellDetail.create({
                    Order_id: newOrder.order_id,
                    Pro_id: item.productId,
                    qty: item.quantity,
                    Total: Math.round(Number(item.price) * Number(item.quantity)),
                    date: newOrder.date ?? new Date(),
                    image: product.pro_image ?? null,
                }, { transaction });
            }
            await transaction.commit();
            await EmailService_1.default.sendOrderConfirmation(newOrder, items);
            await NotificationService_1.default.notifyAdmin('new_order', {
                orderId: newOrder.order_id,
                customerId: customerId,
                totalPrice: totalPrice,
                date: new Date()
            });
            return newOrder;
        }
        catch (error) {
            await transaction.rollback();
            console.error('Error creating order:', error);
            return null;
        }
    }
    /**
     * Get order details with products and customer information
     * @param orderId Order ID
     */
    async getOrderDetails(orderId) {
        try {
            const order = await models_1.Order.findByPk(orderId, {
                include: [
                    {
                        model: models_1.Customer,
                        as: 'customer'
                    },
                    {
                        model: models_1.BillSellDetail,
                        as: 'billDetails',
                        include: [
                            {
                                model: models_1.Product,
                                as: 'product'
                            }
                        ]
                    }
                ]
            });
            return order;
        }
        catch (error) {
            console.error('Error fetching order details:', error);
            return null;
        }
    }
    /**
     * Cancel an order
     * @param orderId Order ID
     */
    async cancelOrder(orderId) {
        const transaction = await models_1.sequelize.transaction();
        try {
            const order = await models_1.Order.findByPk(orderId, { transaction });
            if (!order) {
                await transaction.rollback();
                throw new Error('Order not found');
            }
            if (order.shipping_status === 'shipped' || order.shipping_status === 'delivered') {
                await transaction.rollback();
                throw new Error('Cannot cancel order that has been shipped or delivered');
            }
            if (order.payment_status === 'verified') {
                await StockService_1.default.restoreStock(orderId, transaction);
            }
            await order.update({
                payment_status: 'rejected',
                shipping_status: 'cancelled'
            }, { transaction });
            await transaction.commit();
            await EmailService_1.default.sendOrderCancellation(order);
            return true;
        }
        catch (error) {
            await transaction.rollback();
            console.error('Error cancelling order:', error);
            return false;
        }
    }
    /**
     * Update shipping status
     * @param orderId Order ID
     * @param status New shipping status
     * @param trackingNumber Tracking number (optional)
     */
    async updateShippingStatus(orderId, status, trackingNumber) {
        try {
            const order = await models_1.Order.findByPk(orderId, {
                include: [{
                        association: 'customer'
                    }]
            });
            if (!order) {
                throw new Error('Order not found');
            }
            if (order.payment_status !== 'verified' && (status === 'processing' || status === 'shipped')) {
                throw new Error('Cannot update shipping status: Payment not verified');
            }
            const updateData = { shipping_status: status };
            if (trackingNumber) {
                updateData.tracking_number = trackingNumber;
            }
            await order.update(updateData);
            if (status === 'shipped' && order.customer) {
                await EmailService_1.default.sendShippingNotification(order);
            }
            await NotificationService_1.default.notifyCustomer('shipping_update', {
                orderId: order.order_id,
                status: status,
                trackingNumber: trackingNumber,
                date: new Date()
            });
            return true;
        }
        catch (error) {
            console.error('Error updating shipping status:', error);
            return false;
        }
    }
    /**
     * Get orders by customer
     * @param customerId Customer ID
     */
    async getCustomerOrders(customerId) {
        try {
            const orders = await models_1.Order.findAll({
                where: {
                    cus_id: customerId
                },
                include: [
                    {
                        model: models_1.BillSellDetail,
                        as: 'billDetails',
                        include: [
                            {
                                model: models_1.Product,
                                as: 'product'
                            }
                        ]
                    }
                ],
                order: [['date', 'DESC']]
            });
            return orders;
        }
        catch (error) {
            console.error('Error fetching customer orders:', error);
            return [];
        }
    }
    /**
     * Get orders by shipping status
     * @param status Shipping status
     */
    async getOrdersByShippingStatus(status) {
        try {
            const orders = await models_1.Order.findAll({
                where: {
                    shipping_status: status
                },
                include: [
                    {
                        model: models_1.Customer,
                        as: 'customer'
                    },
                    {
                        model: models_1.BillSellDetail,
                        as: 'billDetails',
                        include: [
                            {
                                model: models_1.Product,
                                as: 'product'
                            }
                        ]
                    }
                ],
                order: [['date', 'ASC']]
            });
            return orders;
        }
        catch (error) {
            console.error('Error fetching orders by shipping status:', error);
            return [];
        }
    }
    /**
     * Get all orders with pagination
     * @param page Page number
     * @param limit Items per page
     */
    async getAllOrders(page = 1, limit = 10) {
        try {
            const offset = (page - 1) * limit;
            const { count, rows } = await models_1.Order.findAndCountAll({
                include: [
                    {
                        model: models_1.Customer,
                        as: 'customer'
                    },
                    {
                        model: models_1.BillSellDetail,
                        as: 'billDetails',
                        include: [
                            {
                                model: models_1.Product,
                                as: 'product'
                            }
                        ]
                    }
                ],
                order: [['date', 'DESC']],
                limit,
                offset
            });
            return {
                orders: rows,
                total: count,
                pages: Math.ceil(count / limit)
            };
        }
        catch (error) {
            console.error('Error fetching all orders:', error);
            return {
                orders: [],
                total: 0,
                pages: 0
            };
        }
    }
    /**
     * Get order statistics
     */
    async getOrderStats() {
        try {
            // Count orders by shipping status
            const waitingOrders = await models_1.Order.count({
                where: { shipping_status: 'waiting' }
            });
            const processingOrders = await models_1.Order.count({
                where: { shipping_status: 'processing' }
            });
            const shippedOrders = await models_1.Order.count({
                where: { shipping_status: 'shipped' }
            });
            const deliveredOrders = await models_1.Order.count({
                where: { shipping_status: 'delivered' }
            });
            const cancelledOrders = await models_1.Order.count({
                where: { shipping_status: 'cancelled' }
            });
            const totalOrders = await models_1.Order.count();
            const todayStr = new Date().toISOString().slice(0, 10);
            const todayOrders = await models_1.Order.count({
                where: {
                    date: { [sequelize_1.Op.eq]: todayStr }
                }
            });
            return {
                status: {
                    waiting: waitingOrders,
                    processing: processingOrders,
                    shipped: shippedOrders,
                    delivered: deliveredOrders,
                    cancelled: cancelledOrders
                },
                total: totalOrders,
                today: todayOrders
            };
        }
        catch (error) {
            console.error('Error calculating order stats:', error);
            return {
                status: {
                    waiting: 0,
                    processing: 0,
                    shipped: 0,
                    delivered: 0,
                    cancelled: 0
                },
                total: 0,
                today: 0
            };
        }
    }
}
exports.default = new OrderService();
//# sourceMappingURL=OrderService.js.map