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
declare class NotificationService {
    private notifications;
    /**
     * Create a new notification
     * @param notification Notification data
     */
    createNotification(notification: Notification): Promise<boolean>;
    /**
     * Notify admin users about an event
     * @param type Notification type
     * @param data Notification data
     */
    notifyAdmin(type: string, data: NotificationData): Promise<boolean>;
    /**
     * Notify a customer about an event
     * @param type Notification type
     * @param data Notification data
     */
    notifyCustomer(type: string, data: NotificationData): Promise<boolean>;
    /**
     * Get user notifications
     * @param userId User ID
     * @param limit Maximum number of notifications to return
     */
    getUserNotifications(userId: string | number, limit?: number): Promise<Notification[]>;
    /**
     * Mark notification as read
     * @param notificationId Notification ID
     * @param userId User ID (for security)
     */
    markAsRead(notificationId: number, userId: string | number): Promise<boolean>;
    /**
     * Mark all user notifications as read
     * @param userId User ID
     */
    markAllAsRead(userId: string | number): Promise<boolean>;
    /**
     * Count unread notifications
     * @param userId User ID
     */
    countUnread(userId: string | number): Promise<number>;
    /**
     * Delete a notification
     * @param notificationId Notification ID
     * @param userId User ID (for security)
     */
    deleteNotification(notificationId: number, userId: string | number): Promise<boolean>;
}
declare const _default: NotificationService;
export default _default;
//# sourceMappingURL=NotificationService.d.ts.map