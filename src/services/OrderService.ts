// src/services/OrderService.ts
import { Order, BillSellDetail, Product, Customer, sequelize } from '../models';
import { Transaction, Op } from 'sequelize';
import StockService from './StockService';
import EmailService from './EmailService';
import NotificationService from './NotificationService';

// Interface for order items
interface OrderItem {
    productId: number;
    quantity: number;
    price: number;
}

// Interface for order data
interface OrderData {
    customerId: number;
    items: OrderItem[];
    totalPrice: number;
    shippingAddress?: string;
    shippingNote?: string;
}

interface OrderWithCustomer extends Order {
    customer?: Customer;
}

class OrderService {
    /**
     * Create a new order
     * @param orderData Order data
     */
    public async createOrder(orderData: OrderData): Promise<Order | null> {
        // Start a transaction
        const transaction = await sequelize.transaction();

        try {
            const { customerId, items, totalPrice, shippingAddress, shippingNote } = orderData;

            const customer = await Customer.findByPk(customerId);
            if (!customer) {
                await transaction.rollback();
                throw new Error('Customer not found');
            }

            const stockOK = await StockService.checkStock(items);
            if (!stockOK) {
                await transaction.rollback();
                throw new Error('One or more products are out of stock');
            }

            const newOrder = await Order.create({
                cus_id: customerId,
                pro_id: items[0]?.productId ?? null,
                price: Math.round(Number(totalPrice)),
                date: new Date(),
                payment_status: 'pending',
                shipping_status: 'waiting'
            }, { transaction });

            for (const item of items) {
                const product = await Product.findByPk(item.productId);
                if (!product) {
                    await transaction.rollback();
                    throw new Error(`Product with ID ${item.productId} not found`);
                }

                await BillSellDetail.create(
                    {
                        Order_id: newOrder.order_id,
                        Pro_id: item.productId,
                        qty: item.quantity,
                        Total: Math.round(Number(item.price) * Number(item.quantity)),
                        date: newOrder.date ?? new Date(),
                        image: product.pro_image ?? null,
                    },
                    { transaction }
                );
            }

            await transaction.commit();

            await EmailService.sendOrderConfirmation(newOrder, items);

            await NotificationService.notifyAdmin('new_order', {
                orderId: newOrder.order_id,
                customerId: customerId,
                totalPrice: totalPrice,
                date: new Date()
            });

            return newOrder;
        } catch (error) {
            await transaction.rollback();
            console.error('Error creating order:', error);
            return null;
        }
    }

    /**
     * Get order details with products and customer information
     * @param orderId Order ID
     */
    public async getOrderDetails(orderId: number): Promise<Order | null> {
        try {
            const order = await Order.findByPk(orderId, {
                include: [
                    {
                        model: Customer,
                        as: 'customer'
                    },
                    {
                        model: BillSellDetail,
                        as: 'billDetails',
                        include: [
                            {
                                model: Product,
                                as: 'product'
                            }
                        ]
                    }
                ]
            });

            return order;
        } catch (error) {
            console.error('Error fetching order details:', error);
            return null;
        }
    }

    /**
     * Cancel an order
     * @param orderId Order ID
     */
    public async cancelOrder(orderId: number): Promise<boolean> {
        const transaction = await sequelize.transaction();

        try {
            const order = await Order.findByPk(orderId, { transaction });

            if (!order) {
                await transaction.rollback();
                throw new Error('Order not found');
            }
            if (order.shipping_status === 'shipped' || order.shipping_status === 'delivered') {
                await transaction.rollback();
                throw new Error('Cannot cancel order that has been shipped or delivered');
            }
            if (order.payment_status === 'verified') {
                await StockService.restoreStock(orderId, transaction);
            }
            await order.update({
                payment_status: 'rejected',
                shipping_status: 'cancelled'
            }, { transaction });
            await transaction.commit();
            await EmailService.sendOrderCancellation(order);

            return true;
        } catch (error) {
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
    public async updateShippingStatus(
        orderId: number,
        status: 'processing' | 'shipped' | 'delivered' | 'cancelled',
        trackingNumber?: string
    ): Promise<boolean> {
        try {
            const order = await Order.findByPk(orderId, {
                include: [{
                    association: 'customer'
                }]
            }) as unknown as OrderWithCustomer;

            if (!order) {
                throw new Error('Order not found');
            }
            if (order.payment_status !== 'verified' && (status === 'processing' || status === 'shipped')) {
                throw new Error('Cannot update shipping status: Payment not verified');
            }
            const updateData: any = { shipping_status: status };
            if (trackingNumber) {
                updateData.tracking_number = trackingNumber;
            }

            await order.update(updateData);
            if (status === 'shipped' && order.customer) {
                await EmailService.sendShippingNotification(order as OrderWithCustomer);
            }
            await NotificationService.notifyCustomer('shipping_update', {
                orderId: order.order_id,
                status: status,
                trackingNumber: trackingNumber,
                date: new Date()
            });

            return true;
        } catch (error) {
            console.error('Error updating shipping status:', error);
            return false;
        }
    }

    /**
     * Get orders by customer
     * @param customerId Customer ID
     */
    public async getCustomerOrders(customerId: number): Promise<Order[]> {
        try {
            const orders = await Order.findAll({
                where: {
                    cus_id: customerId
                },
                include: [
                    {
                        model: BillSellDetail,
                        as: 'billDetails',
                        include: [
                            {
                                model: Product,
                                as: 'product'
                            }
                        ]
                    }
                ],
                order: [['date', 'DESC']]
            });

            return orders;
        } catch (error) {
            console.error('Error fetching customer orders:', error);
            return [];
        }
    }

    /**
     * Get orders by shipping status
     * @param status Shipping status
     */
    public async getOrdersByShippingStatus(status: string): Promise<Order[]> {
        try {
            const orders = await Order.findAll({
                where: {
                    shipping_status: status
                },
                include: [
                    {
                        model: Customer,
                        as: 'customer'
                    },
                    {
                        model: BillSellDetail,
                        as: 'billDetails',
                        include: [
                            {
                                model: Product,
                                as: 'product'
                            }
                        ]
                    }
                ],
                order: [['date', 'ASC']]
            });

            return orders;
        } catch (error) {
            console.error('Error fetching orders by shipping status:', error);
            return [];
        }
    }

    /**
     * Get all orders with pagination
     * @param page Page number
     * @param limit Items per page
     */
    public async getAllOrders(page: number = 1, limit: number = 10): Promise<{orders: Order[], total: number, pages: number}> {
        try {
            const offset = (page - 1) * limit;

            const { count, rows } = await Order.findAndCountAll({
                include: [
                    {
                        model: Customer,
                        as: 'customer'
                    },
                    {
                        model: BillSellDetail,
                        as: 'billDetails',
                        include: [
                            {
                                model: Product,
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
        } catch (error) {
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
    public async getOrderStats(): Promise<any> {
        try {
            // Count orders by shipping status
            const waitingOrders = await Order.count({
                where: { shipping_status: 'waiting' }
            });

            const processingOrders = await Order.count({
                where: { shipping_status: 'processing' }
            });

            const shippedOrders = await Order.count({
                where: { shipping_status: 'shipped' }
            });

            const deliveredOrders = await Order.count({
                where: { shipping_status: 'delivered' }
            });

            const cancelledOrders = await Order.count({
                where: { shipping_status: 'cancelled' }
            });

            const totalOrders = await Order.count();

            const todayStr = new Date().toISOString().slice(0, 10);

            const todayOrders = await Order.count({
                where: {
                    date: { [Op.eq]: todayStr }
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
        } catch (error) {
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

export default new OrderService();