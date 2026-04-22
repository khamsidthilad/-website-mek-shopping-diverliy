// src/services/PaymentService.ts
import { Order, sequelize, Customer } from '../models';
import { Transaction, Op } from 'sequelize';
import fs from 'fs';
import path from 'path';
import StockService from './StockService';
import NotificationService from './NotificationService';
import EmailService from './EmailService';

interface OrderWithCustomer extends Order {
    customer?: Customer;
}
class PaymentService {
    /**
     * Record a new payment for an order
     * @param orderId Order ID
     * @param paymentImage Path to payment receipt image
     */
    public async recordPayment(orderId: number, paymentImage: string): Promise<boolean> {
        try {
            const order = await Order.findByPk(orderId);

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
            await NotificationService.notifyAdmin('new_payment', {
                orderId: order.order_id,
                amount: order.price,
                date: new Date()
            });

            return true;
        } catch (error) {
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
    public async verifyPayment(
        orderId: number,
        status: 'verified' | 'rejected',
        adminId: number
    ): Promise<boolean> {
        const transaction = await sequelize.transaction();

        try {
            const order = await Order.findByPk(orderId, {
                transaction,
                include: [{
                    association: 'customer'
                }]
            }) as unknown as OrderWithCustomer;

            if (!order) {
                await transaction.rollback();
                throw new Error(`Order with ID ${orderId} not found`);
            }
            if (order.payment_status === status) {
                await transaction.rollback();
                throw new Error(`Payment already ${status}`);
            }
            if (status === 'verified') {
                const stockUpdated = await StockService.reduceStock(orderId, transaction);

                if (!stockUpdated) {
                    await transaction.rollback();
                    throw new Error('Failed to update stock');
                }
                await order.update({
                    payment_status: status,
                    shipping_status: 'processing'
                }, { transaction });
                if (order.customer && order.customer.cus_name) {
                    await EmailService.sendPaymentConfirmation(order);
                }
            } else if (status === 'rejected') {
                await order.update({
                    payment_status: status,
                    shipping_status: 'cancelled'
                }, { transaction });
                if (order.customer && order.customer.cus_name) {
                    await EmailService.sendPaymentRejection(order);
                }
            }
            console.log(`Payment for order ${orderId} ${status} by admin ${adminId}`);
            await transaction.commit();
            await NotificationService.notifyCustomer('payment_status', {
                orderId: order.order_id,
                status: status,
                date: new Date()
            });

            return true;
        } catch (error) {
            await transaction.rollback();
            console.error('Error verifying payment:', error);
            return false;
        }
    }

    /**
     * Get payment receipt file path
     * @param orderId Order ID
     */
    public async getPaymentReceipt(orderId: number): Promise<string | null> {
        try {
            const order = await Order.findByPk(orderId);

            if (!order || !order.payment_image) {
                return null;
            }

            const filePath = path.join(__dirname, '../../public', order.payment_image);

            if (!fs.existsSync(filePath)) {
                return null;
            }

            return order.payment_image;
        } catch (error) {
            console.error('Error getting payment receipt:', error);
            return null;
        }
    }

    /**
     * Calculate payment statistics
     */
    public async getPaymentStats(): Promise<any> {
        try {
            const pendingPayments = await Order.count({
                where: { payment_status: 'pending' }
            });

            const verifiedPayments = await Order.count({
                where: { payment_status: 'verified' }
            });

            const rejectedPayments = await Order.count({
                where: { payment_status: 'rejected' }
            });

            const totalRevenue = await Order.sum('price', {
                where: { payment_status: 'verified' }
            });

            const todayStr = new Date().toISOString().slice(0, 10);

            const todayRevenue = await Order.sum('price', {
                where: {
                    payment_status: 'verified',
                    date: { [Op.eq]: todayStr }
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
        } catch (error) {
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

export default new PaymentService();
