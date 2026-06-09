import { Order } from '../models';
declare class EmailService {
    private transporter;
    private templates;
    private emailConfig;
    constructor();
    /**
     * Initialize email templates
     */
    private initTemplates;
    /**
     * Send an email
     * @param to Recipient email
     * @param subject Email subject
     * @param html Email HTML content
     */
    private sendEmail;
    sendContactMessage({ to, name, email, message, }: {
        to: string;
        name: string;
        email: string;
        message: string;
    }): Promise<boolean>;
    /**
     * Get customer email from order
     * @param order Order object
     */
    private getCustomerEmail;
    /**
     * Send order confirmation email
     * @param order Order object
     * @param items Order items (optional, will load from database if not provided)
     */
    sendOrderConfirmation(order: Order, items?: any[]): Promise<boolean>;
    /**
     * Send payment confirmation email
     * @param order Order object
     */
    sendPaymentConfirmation(order: Order): Promise<boolean>;
    /**
     * Send payment rejection email
     * @param order Order object
     */
    sendPaymentRejection(order: Order): Promise<boolean>;
    /**
     * Send order cancellation email
     * @param order Order object
     */
    sendOrderCancellation(order: Order): Promise<boolean>;
    /**
     * Send shipping notification email
     * @param order Order object
     */
    sendShippingNotification(order: Order): Promise<boolean>;
    /**
     * Send admin notification about new order
     * @param orderId Order ID
     * @param adminEmail Admin email
     */
    sendAdminOrderNotification(orderId: number, adminEmail: string): Promise<boolean>;
    /**
     * Send admin notification about new payment
     * @param orderId Order ID
     * @param adminEmail Admin email
     */
    sendAdminPaymentNotification(orderId: number, adminEmail: string): Promise<boolean>;
    private getOrderConfirmationTemplate;
    private getPaymentConfirmationTemplate;
    private getPaymentRejectedTemplate;
    private getOrderCancelledTemplate;
    private getShippingNotificationTemplate;
    private getAdminOrderNotificationTemplate;
    private getAdminPaymentNotificationTemplate;
}
declare const _default: EmailService;
export default _default;
//# sourceMappingURL=EmailService.d.ts.map