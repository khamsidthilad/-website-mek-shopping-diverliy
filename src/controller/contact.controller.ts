import { Request, Response } from 'express';
import ContactMessage from '../models/contactMessage.model';
import EmailService from '../services/EmailService';

function serializeError(error: unknown): { message: string } {
  if (error instanceof Error) return { message: error.message };
  return { message: String(error) };
}

class ContactController {
  public async getInfo(req: Request, res: Response): Promise<void> {
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
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to load contact information',
        error: serializeError(error),
      });
    }
  }

  public async submitMessage(req: Request, res: Response): Promise<void> {
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

      const supportEmail =
        process.env.SUPPORT_EMAIL || process.env.SHOP_EMAIL || process.env.EMAIL_FROM || 'hello@sportshop.com';

      const emailed = await EmailService.sendContactMessage({
        to: supportEmail,
        name,
        email,
        message,
      });

      if (!emailed) {
        res.status(500).json({ success: false, message: 'Failed to send message email' });
        return;
      }

      let messageId: number | undefined;
      try {
        const saved = await ContactMessage.create({ name, email, message });
        messageId = saved.id;
      } catch (dbError) {
        console.warn('Contact message saved to email but not database:', serializeError(dbError).message);
      }

      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: messageId ? { id: messageId } : undefined,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to send message',
        error: serializeError(error),
      });
    }
  }
}

export default new ContactController();
