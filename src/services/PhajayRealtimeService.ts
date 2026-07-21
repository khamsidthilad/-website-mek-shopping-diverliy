/**
 * PhaJay SocketIO realtime — marks orders verified when customer pays.
 * Docs: https://payment-doc.lailaolab.com/v1/connect-payment-QR/subscription
 */
import { io, type Socket } from "socket.io-client";
import Order from "../models/order.model";
import Customer from "../models/customer.model";
import PhajayService, { PhajayWebhookPayload } from "./PhajayService";
import NotificationService from "./NotificationService";
import EmailService from "./EmailService";

function stripQuotes(value: string | undefined): string {
  return (value ?? "").trim().replace(/^["']|["']$/g, "");
}

function resolveSecretKey(): string {
  const sandbox =
    (process.env.PHAJAY_SANDBOX ?? "true").trim().toLowerCase() === "true";
  const secret = stripQuotes(process.env.PHAJAY_SECRET_KEY);
  const publicKey = stripQuotes(process.env.PHAJAY_PUBLIC_KEY);
  const devKey = stripQuotes(process.env.PHAJAY_DEV_KEY);
  if (sandbox) return publicKey || devKey || secret;
  return secret || publicKey || devKey;
}

async function verifyOrderFromPayload(
  payload: PhajayWebhookPayload,
): Promise<void> {
  if (!PhajayService.isPaymentCompleted(payload)) return;

  const transactionId = String(payload.transactionId ?? "").trim();
  let order: Order | null = null;

  if (transactionId) {
    order = await Order.findOne({
      where: { phajay_transaction_id: transactionId },
    });
  }

  if (!order) {
    const orderId = PhajayService.parseOrderIdFromTags(payload);
    if (orderId) order = await Order.findByPk(orderId);
  }

  if (!order) {
    console.warn(
      "[phajay-socket] order not found",
      transactionId || payload.tag3,
    );
    return;
  }

  if (order.payment_status === "verified") return;

  await order.update({
    payment_status: "verified",
    shipping_status: "processing",
    phajay_transaction_id: transactionId || order.phajay_transaction_id,
    payment_bank:
      (payload.paymentMethod as string)?.toLowerCase() || order.payment_bank,
  });

  console.info(
    `[phajay-socket] order #${order.order_id} verified (txn=${transactionId})`,
  );

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
  } catch (err) {
    console.error("[phajay-socket] notify failed", err);
  }
}

class PhajayRealtimeService {
  private socket: Socket | null = null;

  public start(): void {
    const secretKey = resolveSecretKey();
    if (!secretKey || secretKey.includes("your-") || secretKey.includes("paste")) {
      console.warn("[phajay-socket] skipped — missing PhaJay key");
      return;
    }

    if (this.socket?.connected) return;

    const gateway =
      stripQuotes(process.env.PHAJAY_GATEWAY_URL) ||
      "https://payment-gateway.phajay.co";

    this.socket = io(gateway.replace(/\/$/, "") + "/", {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      timeout: 20000,
    });

    this.socket.on("connect", () => {
      console.info("[phajay-socket] connected", this.socket?.id);
    });

    const eventName = `join::${secretKey}`;
    this.socket.on(eventName, (data: PhajayWebhookPayload) => {
      console.info("[phajay-socket] event", {
        status: data?.status,
        transactionId: data?.transactionId,
        tag3: data?.tag3,
      });
      void verifyOrderFromPayload(data).catch((err) => {
        console.error("[phajay-socket] verify failed", err);
      });
    });

    this.socket.on("connect_error", (err) => {
      console.error("[phajay-socket] connect_error", err.message);
    });

    this.socket.on("disconnect", (reason) => {
      console.warn("[phajay-socket] disconnect", reason);
    });
  }
}

export default new PhajayRealtimeService();
