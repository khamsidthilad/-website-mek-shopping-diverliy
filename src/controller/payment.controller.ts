import { Request, Response } from "express";
import Order from "../models/order.model";
import PhajayService, {
  PhajayBank,
  PhajayWebhookPayload,
} from "../services/PhajayService";
import NotificationService from "../services/NotificationService";
import EmailService from "../services/EmailService";
import Customer from "../models/customer.model";
import {
  getCachedQr,
  setCachedQr,
  withQrInflight,
} from "../services/PhajayQrCache";

type AuthUser = { customerId?: number; role?: string };

function serializeError(error: unknown): { message: string } {
  if (error instanceof Error) return { message: error.message };
  return { message: String(error) };
}

class PaymentController {
  /**
   * POST /api/orders/:orderId/payment/qr
   * Body (optional): { bank?: "bcel" | "jdb" | "ldb" | "ib" | "stb" | "m-money", force?: boolean }
   */
  public async generateOrderQr(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as Request & { user?: AuthUser }).user;
      const orderId = parseInt(String(req.params.orderId), 10);
      const force = Boolean(req.body?.force);

      if (!Number.isInteger(orderId) || orderId < 1) {
        res.status(400).json({ success: false, message: "Invalid order ID" });
        return;
      }

      const order = await Order.findByPk(orderId);
      if (!order) {
        res.status(404).json({ success: false, message: "Order not found" });
        return;
      }

      if (
        user?.role === "customer" &&
        user.customerId != null &&
        order.cus_id !== user.customerId
      ) {
        res.status(403).json({
          success: false,
          message: "You can only pay for your own orders",
        });
        return;
      }

      if (order.payment_status === "verified") {
        res.status(400).json({
          success: false,
          message: "Payment already verified",
        });
        return;
      }

      if (order.price == null || order.price <= 0) {
        res.status(400).json({
          success: false,
          message: "Order has no payable amount",
        });
        return;
      }

      if (!force) {
        const cached = getCachedQr(orderId);
        if (
          cached &&
          order.phajay_transaction_id &&
          cached.transactionId === order.phajay_transaction_id
        ) {
          res.status(200).json({
            success: true,
            message: "QR payment (cached)",
            data: cached,
          });
          return;
        }
      }

      const bank = (req.body?.bank as PhajayBank | undefined) ?? undefined;
      const shopName = process.env.SHOP_NAME || "Shop";

      const forced = Number(process.env.PHAJAY_FORCE_AMOUNT);
      const payAmount =
        Number.isFinite(forced) && forced > 0 ? forced : order.price;

      const data = await withQrInflight(orderId, async () => {
        // Re-check cache inside lock (second concurrent request)
        if (!force) {
          const again = getCachedQr(orderId);
          if (again) return again;
        }

        const qr = await PhajayService.generateQr({
          amount: payAmount as number,
          description: `Order ${order.order_id}`,
          bank,
          tag1: shopName.slice(0, 50),
          tag2: String(order.cus_id ?? ""),
          tag3: String(order.order_id),
        });

        await order.update({
          phajay_transaction_id: qr.transactionId,
          payment_bank: qr.bank,
          payment_status: "awaiting_payment",
        });

        return setCachedQr({
          orderId: order.order_id,
          amount: payAmount as number,
          currency: process.env.PHAJAY_CURRENCY || "KIP",
          bank: qr.bank,
          transactionId: qr.transactionId,
          qrCode: qr.qrCode,
          qrImageUrl: qr.qrImageUrl,
          deepLink: qr.link,
          paymentStatus: "awaiting_payment",
        });
      });

      res.status(200).json({
        success: true,
        message: "QR payment generated",
        data,
      });
    } catch (error) {
      console.error("[generateOrderQr]", error);
      const msg = serializeError(error).message;
      const is429 =
        msg.includes("429") || msg.toUpperCase().includes("TOO_MANY_REQUESTS");
      res.status(is429 ? 429 : 502).json({
        success: false,
        message: is429
          ? "PhaJay rate limit — wait ~30s then retry"
          : "Failed to generate PhaJay QR",
        error: serializeError(error),
      });
    }
  }

  /**
   * GET /api/orders/:orderId/payment/status
   */
  public async getPaymentStatus(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as Request & { user?: AuthUser }).user;
      const orderId = parseInt(String(req.params.orderId), 10);

      if (!Number.isInteger(orderId) || orderId < 1) {
        res.status(400).json({ success: false, message: "Invalid order ID" });
        return;
      }

      const order = await Order.findByPk(orderId);
      if (!order) {
        res.status(404).json({ success: false, message: "Order not found" });
        return;
      }

      if (
        user?.role === "customer" &&
        user.customerId != null &&
        order.cus_id !== user.customerId
      ) {
        res.status(403).json({ success: false, message: "Forbidden" });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          orderId: order.order_id,
          amount: order.price,
          paymentStatus: order.payment_status,
          paymentBank: order.payment_bank,
          transactionId: order.phajay_transaction_id,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to get payment status",
        error: serializeError(error),
      });
    }
  }

  /**
   * POST /api/payments/phajay/webhook
   * Configure this URL in PhaJay portal → Settings → Webhook
   * e.g. https://yourdomain.com/api/payments/phajay/webhook
   */
  public async phajayWebhook(req: Request, res: Response): Promise<void> {
    try {
      const payload = (req.body ?? {}) as PhajayWebhookPayload;
      console.log("[phajayWebhook]", JSON.stringify(payload));

      if (!PhajayService.isPaymentCompleted(payload)) {
        res.status(200).json({
          success: true,
          message: "Ignored non-completed status",
          status: payload.status ?? null,
        });
        return;
      }

      const transactionId = String(payload.transactionId ?? "").trim();
      let order: Order | null = null;

      if (transactionId) {
        order = await Order.findOne({
          where: { phajay_transaction_id: transactionId },
        });
      }

      if (!order) {
        const orderId = PhajayService.parseOrderIdFromTags(payload);
        if (orderId) {
          order = await Order.findByPk(orderId);
        }
      }

      if (!order) {
        console.warn(
          "[phajayWebhook] Order not found for",
          transactionId || payload.tag3,
        );
        res.status(200).json({
          success: false,
          message: "Order not found (acked)",
        });
        return;
      }

      if (order.payment_status === "verified") {
        res.status(200).json({
          success: true,
          message: "Already verified",
          orderId: order.order_id,
        });
        return;
      }

      const paidAmount = Number(payload.txnAmount);
      if (
        Number.isFinite(paidAmount) &&
        order.price != null &&
        paidAmount > 0 &&
        paidAmount < order.price
      ) {
        console.warn(
          `[phajayWebhook] Amount mismatch order=${order.order_id} expected=${order.price} got=${paidAmount}`,
        );
      }

      await order.update({
        payment_status: "verified",
        shipping_status: "processing",
        phajay_transaction_id:
          transactionId || order.phajay_transaction_id,
        payment_bank:
          (payload.paymentMethod as string)?.toLowerCase() ||
          order.payment_bank,
      });

      try {
        const customer = order.cus_id
          ? await Customer.findByPk(order.cus_id)
          : null;
        if (customer) {
          (order as Order & { customer?: Customer }).customer = customer;
          await EmailService.sendPaymentConfirmation(order);
        }
        await NotificationService.notifyCustomer("payment_status", {
          orderId: order.order_id,
          status: "verified",
          date: new Date(),
        });
        await NotificationService.notifyAdmin("new_payment", {
          orderId: order.order_id,
          amount: order.price,
          date: new Date(),
        });
      } catch (notifyErr) {
        console.error("[phajayWebhook] notify/email failed", notifyErr);
      }

      res.status(200).json({
        success: true,
        message: "Payment verified",
        orderId: order.order_id,
      });
    } catch (error) {
      console.error("[phajayWebhook]", error);
      // Still 200 so PhaJay does not retry endlessly on our bugs;
      // log and fix manually.
      res.status(200).json({
        success: false,
        message: "Webhook handling error",
        error: serializeError(error),
      });
    }
  }
}

export default new PaymentController();
