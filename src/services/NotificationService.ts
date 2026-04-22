import { Op } from 'sequelize';
import { User, Customer, Order } from '../models';
import EmailService from './EmailService';

interface NotificationData {
    [key: string]: any;
}

interface Notification {
    id?: number;
    userId: string | number;
    message: string;
    type: string;
    data: NotificationData;
    isRead?: boolean;
    createdAt?: Date;
}

interface OrderWithCustomer extends Order {
    customer?: Customer;
}

class NotificationService {
    private notifications: Notification[] = [];

    /**
     * Create a new notification
     * @param notification Notification data
     */
    public async createNotification(notification: Notification): Promise<boolean> {
        try {
            const id = this.notifications.length + 1;
            this.notifications.push({
                ...notification,
                id,
                isRead: false,
                createdAt: new Date()
            });

            return true;
        } catch (error) {
            console.error('Error creating notification:', error);
            return false;
        }
    }

    /**
     * Notify admin users about an event
     * @param type Notification type
     * @param data Notification data
     */
    public async notifyAdmin(type: string, data: NotificationData): Promise<boolean> {
        try {
            const admins = await User.findAll({
                where: {
                    role: { [Op.in]: ['admin', 'staff'] }
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
                    await EmailService.sendAdminOrderNotification(data.orderId, admins[0].Email);
                } else if (type === 'new_payment') {
                    await EmailService.sendAdminPaymentNotification(data.orderId, admins[0].Email);
                }
            }

            return true;
        } catch (error) {
            console.error('Error notifying admin:', error);
            return false;
        }
    }

    /**
     * Notify a customer about an event
     * @param type Notification type
     * @param data Notification data
     */
    public async notifyCustomer(type: string, data: NotificationData): Promise<boolean> {
        try {
            const order = await Order.findByPk(data.orderId, {
                include: [{
                    model: Customer,
                    as: 'customer'
                }]
            }) as unknown as OrderWithCustomer;

            if (!order || !order.customer) {
                console.warn('Order or customer not found for notification');
                return false;
            }
            const user = await User.findOne({
                where: {
                    role: 'customer',
                    User_id: `CUS${order.customer!.cus_id.toString().padStart(5, '0')}`
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
        } catch (error) {
            console.error('Error notifying customer:', error);
            return false;
        }
    }

    /**
     * Get user notifications
     * @param userId User ID
     * @param limit Maximum number of notifications to return
     */
    public async getUserNotifications(userId: string | number, limit: number = 10): Promise<Notification[]> {
        try {
            return this.notifications
                .filter(notification => notification.userId === userId)
                .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
                .slice(0, limit);
        } catch (error) {
            console.error('Error getting user notifications:', error);
            return [];
        }
    }

    /**
     * Mark notification as read
     * @param notificationId Notification ID
     * @param userId User ID (for security)
     */
    public async markAsRead(notificationId: number, userId: string | number): Promise<boolean> {
        try {
            const notificationIndex = this.notifications.findIndex(
                n => n.id === notificationId && n.userId === userId
            );

            if (notificationIndex === -1) {
                return false;
            }

            this.notifications[notificationIndex].isRead = true;
            return true;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            return false;
        }
    }

    /**
     * Mark all user notifications as read
     * @param userId User ID
     */
    public async markAllAsRead(userId: string | number): Promise<boolean> {
        try {
            this.notifications
                .filter(notification => notification.userId === userId)
                .forEach(notification => {
                    notification.isRead = true;
                });

            return true;
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            return false;
        }
    }

    /**
     * Count unread notifications
     * @param userId User ID
     */
    public async countUnread(userId: string | number): Promise<number> {
        try {
            return this.notifications.filter(
                notification => notification.userId === userId && !notification.isRead
            ).length;
        } catch (error) {
            console.error('Error counting unread notifications:', error);
            return 0;
        }
    }

    /**
     * Delete a notification
     * @param notificationId Notification ID
     * @param userId User ID (for security)
     */
    public async deleteNotification(notificationId: number, userId: string | number): Promise<boolean> {
        try {
            const initialLength = this.notifications.length;
            this.notifications = this.notifications.filter(
                n => !(n.id === notificationId && n.userId === userId)
            );

            return this.notifications.length < initialLength;
        } catch (error) {
            console.error('Error deleting notification:', error);
            return false;
        }
    }
}

export default new NotificationService();