"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const EmailService_1 = __importDefault(require("./EmailService"));
class NotificationService {
    constructor() {
        this.notifications = [];
    }
    /**
     * Create a new notification
     * @param notification Notification data
     */
    async createNotification(notification) {
        try {
            const id = this.notifications.length + 1;
            this.notifications.push({
                ...notification,
                id,
                isRead: false,
                createdAt: new Date()
            });
            return true;
        }
        catch (error) {
            console.error('Error creating notification:', error);
            return false;
        }
    }
    /**
     * Notify admin users about an event
     * @param type Notification type
     * @param data Notification data
     */
    async notifyAdmin(type, data) {
        try {
            const admins = await models_1.User.findAll({
                where: {
                    role: { [sequelize_1.Op.in]: ['admin', 'staff'] }
                }
            });
            if (admins.length === 0) {
                console.warn('No admin users found for notification');
                return false;
            }
            let message = '';
            switch (type) {
                case 'new_order':
                    message = `New order #${data.orderId} has been created. Total: ฿${data.totalPrice}`;
                    break;
                case 'new_payment':
                    message = `New payment receipt uploaded for order #${data.orderId}. Amount: ฿${data.amount}`;
                    break;
                case 'low_stock':
                    message = `Low stock alert: Product ${data.productName} has only ${data.quantity} units left`;
                    break;
                case 'system':
                    message = data.message || 'System notification';
                    break;
                default:
                    message = `New notification: ${JSON.stringify(data)}`;
            }
            for (const admin of admins) {
                await this.createNotification({
                    userId: admin.User_id,
                    message,
                    type,
                    data
                });
            }
            if (admins[0] && admins[0].Email) {
                if (type === 'new_order') {
                    await EmailService_1.default.sendAdminOrderNotification(data.orderId, admins[0].Email);
                }
                else if (type === 'new_payment') {
                    await EmailService_1.default.sendAdminPaymentNotification(data.orderId, admins[0].Email);
                }
            }
            return true;
        }
        catch (error) {
            console.error('Error notifying admin:', error);
            return false;
        }
    }
    /**
     * Notify a customer about an event
     * @param type Notification type
     * @param data Notification data
     */
    async notifyCustomer(type, data) {
        try {
            const order = await models_1.Order.findByPk(data.orderId, {
                include: [{
                        model: models_1.Customer,
                        as: 'customer'
                    }]
            });
            if (!order || !order.customer) {
                console.warn('Order or customer not found for notification');
                return false;
            }
            const user = await models_1.User.findOne({
                where: {
                    role: 'customer',
                    User_id: `CUS${order.customer.cus_id.toString().padStart(5, '0')}`
                }
            });
            if (!user) {
                console.warn('User not found for customer notification');
                return false;
            }
            // Generate notification message based on type
            let message = '';
            switch (type) {
                case 'order_created':
                    message = `Your order #${data.orderId} has been created successfully. Total: ฿${data.totalPrice}`;
                    break;
                case 'payment_status':
                    message = `Payment for order #${data.orderId} has been ${data.status}`;
                    break;
                case 'shipping_update':
                    message = `Order #${data.orderId} shipping status updated to: ${data.status}`;
                    if (data.trackingNumber) {
                        message += `. Tracking number: ${data.trackingNumber}`;
                    }
                    break;
                case 'refund_processed':
                    message = `Refund for order #${data.orderId} has been processed. Amount: ฿${data.amount}`;
                    if (data.reason) {
                        message += `. Reason: ${data.reason}`;
                    }
                    break;
                default:
                    message = `New notification for order #${data.orderId}`;
            }
            // Create notification
            await this.createNotification({
                userId: user.User_id,
                message,
                type,
                data
            });
            return true;
        }
        catch (error) {
            console.error('Error notifying customer:', error);
            return false;
        }
    }
    /**
     * Get user notifications
     * @param userId User ID
     * @param limit Maximum number of notifications to return
     */
    async getUserNotifications(userId, limit = 10) {
        try {
            return this.notifications
                .filter(notification => notification.userId === userId)
                .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
                .slice(0, limit);
        }
        catch (error) {
            console.error('Error getting user notifications:', error);
            return [];
        }
    }
    /**
     * Mark notification as read
     * @param notificationId Notification ID
     * @param userId User ID (for security)
     */
    async markAsRead(notificationId, userId) {
        try {
            const notificationIndex = this.notifications.findIndex(n => n.id === notificationId && n.userId === userId);
            if (notificationIndex === -1) {
                return false;
            }
            this.notifications[notificationIndex].isRead = true;
            return true;
        }
        catch (error) {
            console.error('Error marking notification as read:', error);
            return false;
        }
    }
    /**
     * Mark all user notifications as read
     * @param userId User ID
     */
    async markAllAsRead(userId) {
        try {
            this.notifications
                .filter(notification => notification.userId === userId)
                .forEach(notification => {
                notification.isRead = true;
            });
            return true;
        }
        catch (error) {
            console.error('Error marking all notifications as read:', error);
            return false;
        }
    }
    /**
     * Count unread notifications
     * @param userId User ID
     */
    async countUnread(userId) {
        try {
            return this.notifications.filter(notification => notification.userId === userId && !notification.isRead).length;
        }
        catch (error) {
            console.error('Error counting unread notifications:', error);
            return 0;
        }
    }
    /**
     * Delete a notification
     * @param notificationId Notification ID
     * @param userId User ID (for security)
     */
    async deleteNotification(notificationId, userId) {
        try {
            const initialLength = this.notifications.length;
            this.notifications = this.notifications.filter(n => !(n.id === notificationId && n.userId === userId));
            return this.notifications.length < initialLength;
        }
        catch (error) {
            console.error('Error deleting notification:', error);
            return false;
        }
    }
}
exports.default = new NotificationService();
//# sourceMappingURL=NotificationService.js.map