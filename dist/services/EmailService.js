"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const models_1 = require("../models");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const handlebars_1 = __importDefault(require("handlebars"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class EmailService {
    constructor() {
        this.templates = {};
        this.emailConfig = {
            from: process.env.EMAIL_FROM || 'shop@example.com',
            shopName: process.env.SHOP_NAME || 'Online Shop'
        };
        this.transporter = nodemailer_1.default.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
            port: parseInt(process.env.EMAIL_PORT || '2525'),
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
        this.initTemplates();
    }
    /**
     * Initialize email templates
     */
    initTemplates() {
        try {
            const templatesDir = path_1.default.join(__dirname, '../templates/emails');
            if (!fs_1.default.existsSync(templatesDir)) {
                fs_1.default.mkdirSync(templatesDir, { recursive: true });
                const templates = {
                    'order-confirmation.html': this.getOrderConfirmationTemplate(),
                    'payment-confirmation.html': this.getPaymentConfirmationTemplate(),
                    'payment-rejected.html': this.getPaymentRejectedTemplate(),
                    'order-cancelled.html': this.getOrderCancelledTemplate(),
                    'shipping-notification.html': this.getShippingNotificationTemplate(),
                    'admin-order-notification.html': this.getAdminOrderNotificationTemplate(),
                    'admin-payment-notification.html': this.getAdminPaymentNotificationTemplate()
                };
                for (const [filename, content] of Object.entries(templates)) {
                    fs_1.default.writeFileSync(path_1.default.join(templatesDir, filename), content);
                }
            }
            const templateFiles = fs_1.default.readdirSync(templatesDir);
            for (const file of templateFiles) {
                if (file.endsWith('.html')) {
                    const templatePath = path_1.default.join(templatesDir, file);
                    const templateContent = fs_1.default.readFileSync(templatePath, 'utf-8');
                    const templateName = file.replace('.html', '');
                    this.templates[templateName] = handlebars_1.default.compile(templateContent);
                }
            }
        }
        catch (error) {
            console.error('Error initializing email templates:', error);
        }
    }
    /**
     * Send an email
     * @param to Recipient email
     * @param subject Email subject
     * @param html Email HTML content
     */
    async sendEmail(to, subject, html) {
        try {
            if (process.env.NODE_ENV === 'development' && process.env.DISABLE_EMAIL_SENDING === 'true') {
                console.log('========== EMAIL ==========');
                console.log(`To: ${to}`);
                console.log(`Subject: ${subject}`);
                console.log(`Body: ${html.substring(0, 100)}...`);
                console.log('==========================');
                return true;
            }
            const info = await this.transporter.sendMail({
                from: this.emailConfig.from,
                to,
                subject,
                html
            });
            console.log('Email sent:', info.messageId);
            return true;
        }
        catch (error) {
            console.error('Error sending email:', error);
            return false;
        }
    }
    async sendContactMessage({ to, name, email, message, }) {
        const shopName = this.emailConfig.shopName;
        const html = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #111;">New contact message — ${shopName}</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong></p>
                <p style="white-space: pre-wrap;">${message}</p>
            </div>
        `;
        return this.sendEmail(to, `Contact form: ${name}`, html);
    }
    /**
     * Get customer email from order
     * @param order Order object
     */
    async getCustomerEmail(order) {
        try {
            let customer = order.customer;
            if (!customer && order.cus_id) {
                customer = await models_1.Customer.findByPk(order.cus_id);
            }
            if (!customer) {
                return null;
            }
            const user = await models_1.User.findOne({
                where: {
                    role: 'customer',
                    User_id: `CUS${customer.cus_id.toString().padStart(5, '0')}`
                }
            });
            return user?.Email || `customer${customer.cus_id}@example.com`;
        }
        catch (error) {
            console.error('Error getting customer email:', error);
            return null;
        }
    }
    /**
     * Send order confirmation email
     * @param order Order object
     * @param items Order items (optional, will load from database if not provided)
     */
    async sendOrderConfirmation(order, items) {
        try {
            const customerEmail = await this.getCustomerEmail(order);
            if (!customerEmail) {
                throw new Error('Customer email not found');
            }
            let orderItems = items;
            if (!orderItems) {
                const billDetails = await models_1.BillSellDetail.findAll({
                    where: { Order_id: order.order_id },
                    include: [{
                            model: models_1.Product,
                            as: 'product'
                        }]
                });
                orderItems = billDetails.map(detail => {
                    const q = detail.qty || 1;
                    const lineTotal = detail.Total != null ? Number(detail.Total) : 0;
                    const unitPrice = q > 0 ? lineTotal / q : 0;
                    return {
                        productId: detail.Pro_id,
                        productName: detail.product?.pro_name || 'Product',
                        quantity: q,
                        price: unitPrice
                    };
                });
            }
            const templateData = {
                orderNumber: order.order_id,
                orderDate: order.date,
                totalAmount: order.price,
                items: orderItems,
                shopName: this.emailConfig.shopName
            };
            const html = this.templates['order-confirmation'](templateData);
            return await this.sendEmail(customerEmail, `${this.emailConfig.shopName} - Order Confirmation #${order.order_id}`, html);
        }
        catch (error) {
            console.error('Error sending order confirmation email:', error);
            return false;
        }
    }
    /**
     * Send payment confirmation email
     * @param order Order object
     */
    async sendPaymentConfirmation(order) {
        try {
            const customerEmail = await this.getCustomerEmail(order);
            if (!customerEmail) {
                throw new Error('Customer email not found');
            }
            const templateData = {
                orderNumber: order.order_id,
                orderDate: order.date,
                paymentDate: new Date(),
                totalAmount: order.price,
                shopName: this.emailConfig.shopName
            };
            const html = this.templates['payment-confirmation'](templateData);
            return await this.sendEmail(customerEmail, `${this.emailConfig.shopName} - Payment Confirmed for Order #${order.order_id}`, html);
        }
        catch (error) {
            console.error('Error sending payment confirmation email:', error);
            return false;
        }
    }
    /**
     * Send payment rejection email
     * @param order Order object
     */
    async sendPaymentRejection(order) {
        try {
            const customerEmail = await this.getCustomerEmail(order);
            if (!customerEmail) {
                throw new Error('Customer email not found');
            }
            const templateData = {
                orderNumber: order.order_id,
                orderDate: order.date,
                rejectionDate: new Date(),
                totalAmount: order.price,
                shopName: this.emailConfig.shopName,
                supportEmail: process.env.SUPPORT_EMAIL || 'support@example.com'
            };
            const html = this.templates['payment-rejected'](templateData);
            return await this.sendEmail(customerEmail, `${this.emailConfig.shopName} - Payment Rejected for Order #${order.order_id}`, html);
        }
        catch (error) {
            console.error('Error sending payment rejection email:', error);
            return false;
        }
    }
    /**
     * Send order cancellation email
     * @param order Order object
     */
    async sendOrderCancellation(order) {
        try {
            const customerEmail = await this.getCustomerEmail(order);
            if (!customerEmail) {
                throw new Error('Customer email not found');
            }
            const templateData = {
                orderNumber: order.order_id,
                orderDate: order.date,
                cancellationDate: new Date(),
                shopName: this.emailConfig.shopName,
                supportEmail: process.env.SUPPORT_EMAIL || 'support@example.com'
            };
            const html = this.templates['order-cancelled'](templateData);
            return await this.sendEmail(customerEmail, `${this.emailConfig.shopName} - Order #${order.order_id} Cancelled`, html);
        }
        catch (error) {
            console.error('Error sending order cancellation email:', error);
            return false;
        }
    }
    /**
     * Send shipping notification email
     * @param order Order object
     */
    async sendShippingNotification(order) {
        try {
            const customerEmail = await this.getCustomerEmail(order);
            if (!customerEmail) {
                throw new Error('Customer email not found');
            }
            const templateData = {
                orderNumber: order.order_id,
                orderDate: order.date,
                shippingDate: new Date(),
                trackingNumber: order.tracking_number || 'Not available',
                hasTrackingNumber: !!order.tracking_number,
                shopName: this.emailConfig.shopName,
                supportEmail: process.env.SUPPORT_EMAIL || 'support@example.com'
            };
            const html = this.templates['shipping-notification'](templateData);
            return await this.sendEmail(customerEmail, `${this.emailConfig.shopName} - Your Order #${order.order_id} Has Been Shipped`, html);
        }
        catch (error) {
            console.error('Error sending shipping notification email:', error);
            return false;
        }
    }
    /**
     * Send admin notification about new order
     * @param orderId Order ID
     * @param adminEmail Admin email
     */
    async sendAdminOrderNotification(orderId, adminEmail) {
        try {
            const templateData = {
                orderNumber: orderId,
                orderDate: new Date(),
                adminPortalUrl: process.env.ADMIN_PORTAL_URL || 'http://localhost:3000/admin',
                shopName: this.emailConfig.shopName
            };
            const html = this.templates['admin-order-notification'](templateData);
            return await this.sendEmail(adminEmail, `${this.emailConfig.shopName} - New Order #${orderId}`, html);
        }
        catch (error) {
            console.error('Error sending admin order notification:', error);
            return false;
        }
    }
    /**
     * Send admin notification about new payment
     * @param orderId Order ID
     * @param adminEmail Admin email
     */
    async sendAdminPaymentNotification(orderId, adminEmail) {
        try {
            const templateData = {
                orderNumber: orderId,
                paymentDate: new Date(),
                adminPortalUrl: process.env.ADMIN_PORTAL_URL || 'http://localhost:3000/admin',
                shopName: this.emailConfig.shopName
            };
            const html = this.templates['admin-payment-notification'](templateData);
            return await this.sendEmail(adminEmail, `${this.emailConfig.shopName} - New Payment for Order #${orderId}`, html);
        }
        catch (error) {
            console.error('Error sending admin payment notification:', error);
            return false;
        }
    }
    getOrderConfirmationTemplate() {
        return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 10px; text-align: center; }
            .footer { background-color: #f1f1f1; padding: 10px; text-align: center; margin-top: 20px; }
            .order-details { margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f2f2f2; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>{{shopName}}</h1>
                <h2>Order Confirmation</h2>
            </div>
            <p>Thank you for your order!</p>
            <div class="order-details">
                <p><strong>Order Number:</strong> #{{orderNumber}}</p>
                <p><strong>Order Date:</strong> {{orderDate}}</p>
                <p><strong>Total Amount:</strong> ฿{{totalAmount}}</p>
            </div>
            <h3>Order Items:</h3>
            <table>
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Price</th>
                    </tr>
                </thead>
                <tbody>
                    {{#each items}}
                    <tr>
                        <td>{{productName}}</td>
                        <td>{{quantity}}</td>
                        <td>฿{{price}}</td>
                    </tr>
                    {{/each}}
                </tbody>
            </table>
            <p>Please upload your payment receipt to confirm your order.</p>
            <div class="footer">
                <p>© {{shopName}} - All rights reserved</p>
            </div>
        </div>
    </body>
    </html>
    `;
    }
    getPaymentConfirmationTemplate() {
        return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 10px; text-align: center; }
            .footer { background-color: #f1f1f1; padding: 10px; text-align: center; margin-top: 20px; }
            .payment-details { margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>{{shopName}}</h1>
                <h2>Payment Confirmed</h2>
            </div>
            <p>We are pleased to inform you that your payment has been confirmed!</p>
            <div class="payment-details">
                <p><strong>Order Number:</strong> #{{orderNumber}}</p>
                <p><strong>Order Date:</strong> {{orderDate}}</p>
                <p><strong>Payment Date:</strong> {{paymentDate}}</p>
                <p><strong>Amount:</strong> ฿{{totalAmount}}</p>
            </div>
            <p>Your order is now being processed and will be shipped soon.</p>
            <div class="footer">
                <p>© {{shopName}} - All rights reserved</p>
            </div>
        </div>
    </body>
    </html>
    `;
    }
    getPaymentRejectedTemplate() {
        return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f44336; color: white; padding: 10px; text-align: center; }
            .footer { background-color: #f1f1f1; padding: 10px; text-align: center; margin-top: 20px; }
            .payment-details { margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>{{shopName}}</h1>
                <h2>Payment Rejected</h2>
            </div>
            <p>We regret to inform you that your payment could not be verified.</p>
            <div class="payment-details">
                <p><strong>Order Number:</strong> #{{orderNumber}}</p>
                <p><strong>Order Date:</strong> {{orderDate}}</p>
                <p><strong>Rejection Date:</strong> {{rejectionDate}}</p>
                <p><strong>Amount:</strong> ฿{{totalAmount}}</p>
            </div>
            <p>Please check the payment details and try again or contact our support at {{supportEmail}} for assistance.</p>
            <div class="footer">
                <p>© {{shopName}} - All rights reserved</p>
            </div>
        </div>
    </body>
    </html>
    `;
    }
    getOrderCancelledTemplate() {
        return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f44336; color: white; padding: 10px; text-align: center; }
            .footer { background-color: #f1f1f1; padding: 10px; text-align: center; margin-top: 20px; }
            .order-details { margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>{{shopName}}</h1>
                <h2>Order Cancelled</h2>
            </div>
            <p>Your order has been cancelled.</p>
            <div class="order-details">
                <p><strong>Order Number:</strong> #{{orderNumber}}</p>
                <p><strong>Order Date:</strong> {{orderDate}}</p>
                <p><strong>Cancellation Date:</strong> {{cancellationDate}}</p>
            </div>
            <p>If you have any questions or concerns, please contact our support at {{supportEmail}}.</p>
            <div class="footer">
                <p>© {{shopName}} - All rights reserved</p>
            </div>
        </div>
    </body>
    </html>
    `;
    }
    getShippingNotificationTemplate() {
        return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2196F3; color: white; padding: 10px; text-align: center; }
            .footer { background-color: #f1f1f1; padding: 10px; text-align: center; margin-top: 20px; }
            .shipping-details { margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>{{shopName}}</h1>
                <h2>Your Order Has Been Shipped</h2>
            </div>
            <p>Good news! Your order is on its way to you.</p>
            <div class="shipping-details">
                <p><strong>Order Number:</strong> #{{orderNumber}}</p>
                <p><strong>Order Date:</strong> {{orderDate}}</p>
                <p><strong>Shipping Date:</strong> {{shippingDate}}</p>
                {{#if hasTrackingNumber}}
                <p><strong>Tracking Number:</strong> {{trackingNumber}}</p>
                {{/if}}
            </div>
            <p>If you have any questions about your delivery, please contact our support at {{supportEmail}}.</p>
            <div class="footer">
                <p>© {{shopName}} - All rights reserved</p>
            </div>
        </div>
    </body>
    </html>
    `;
    }
    getAdminOrderNotificationTemplate() {
        return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #673AB7; color: white; padding: 10px; text-align: center; }
            .footer { background-color: #f1f1f1; padding: 10px; text-align: center; margin-top: 20px; }
            .button { background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>{{shopName}} Admin</h1>
                <h2>New Order Received</h2>
            </div>
            <p>A new order has been placed:</p>
            <p><strong>Order Number:</strong> #{{orderNumber}}</p>
            <p><strong>Order Date:</strong> {{orderDate}}</p>
            <p><a href="{{adminPortalUrl}}/orders/{{orderNumber}}" class="button">View Order Details</a></p>
            <div class="footer">
                <p>© {{shopName}} - Admin Portal</p>
            </div>
        </div>
    </body>
    </html>
    `;
    }
    getAdminPaymentNotificationTemplate() {
        return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #673AB7; color: white; padding: 10px; text-align: center; }
            .footer { background-color: #f1f1f1; padding: 10px; text-align: center; margin-top: 20px; }
            .button { background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>{{shopName}} Admin</h1>
                <h2>New Payment Receipt Uploaded</h2>
            </div>
            <p>A new payment receipt has been uploaded for:</p>
            <p><strong>Order Number:</strong> #{{orderNumber}}</p>
            <p><strong>Payment Date:</strong> {{paymentDate}}</p>
            <p>Please verify the payment as soon as possible.</p>
            <p><a href="{{adminPortalUrl}}/payments/pending" class="button">Verify Payment</a></p>
            <div class="footer">
                <p>© {{shopName}} - Admin Portal</p>
            </div>
        </div>
    </body>
    </html>
    `;
    }
}
exports.default = new EmailService();
//# sourceMappingURL=EmailService.js.map