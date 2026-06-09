"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const contactMessage_model_1 = __importDefault(require("../models/contactMessage.model"));
const EmailService_1 = __importDefault(require("../services/EmailService"));
function serializeError(error) {
    if (error instanceof Error)
        return { message: error.message };
    return { message: String(error) };
}
class ContactController {
    async getInfo(req, res) {
        try {
            res.status(200).json({
                success: true,
                data: {
                    email: process.env.SHOP_EMAIL || process.env.SUPPORT_EMAIL || process.env.EMAIL_FROM || 'hello@sportshop.com',
                    phone: process.env.SHOP_PHONE || '+66 2 123 4567',
                    address: process.env.SHOP_ADDRESS || '123 Sukhumvit Rd, Bangkok 10110',
                    shopName: process.env.SHOP_NAME || 'Sport Shop',
                },
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to load contact information',
                error: serializeError(error),
            });
        }
    }
    async submitMessage(req, res) {
        try {
            const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
            const email = typeof req.body.email === 'string' ? req.body.email.trim() : '';
            const message = typeof req.body.message === 'string' ? req.body.message.trim() : '';
            if (!name || name.length > 100) {
                res.status(400).json({ success: false, message: 'Name is required (max 100 characters)' });
                return;
            }
            if (!email || email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                res.status(400).json({ success: false, message: 'A valid email is required' });
                return;
            }
            if (!message || message.length > 1000) {
                res.status(400).json({ success: false, message: 'Message is required (max 1000 characters)' });
                return;
            }
            const supportEmail = process.env.SUPPORT_EMAIL || process.env.SHOP_EMAIL || process.env.EMAIL_FROM || 'hello@sportshop.com';
            const emailed = await EmailService_1.default.sendContactMessage({
                to: supportEmail,
                name,
                email,
                message,
            });
            if (!emailed) {
                res.status(500).json({ success: false, message: 'Failed to send message email' });
                return;
            }
            let messageId;
            try {
                const saved = await contactMessage_model_1.default.create({ name, email, message });
                messageId = saved.id;
            }
            catch (dbError) {
                console.warn('Contact message saved to email but not database:', serializeError(dbError).message);
            }
            res.status(201).json({
                success: true,
                message: 'Message sent successfully',
                data: messageId ? { id: messageId } : undefined,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to send message',
                error: serializeError(error),
            });
        }
    }
}
exports.default = new ContactController();
//# sourceMappingURL=contact.controller.js.map