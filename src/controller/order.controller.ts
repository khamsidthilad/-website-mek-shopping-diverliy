import { Request, Response } from "express";
import Product from "../models/product.model";
import { sequelize } from "../config/db";
import Customer from "../models/customer.model";
import Order from "../models/order.model";
import BillSellDetail from "../models/billSellDetail.model";

type AuthUser = { customerId?: number; role?: string };

function serializeError(error: unknown): {
  message: string;
  details?: unknown;
} {
  if (error instanceof Error) {
    const anyErr = error as Error & {
      errors?: { message?: string }[];
      parent?: { message?: string };
    };
    const parts = [
      anyErr.message,
      anyErr.parent?.message,
      anyErr.errors
        ?.map((e) => e.message)
        .filter(Boolean)
        .join("; "),
    ].filter(Boolean);
    return {
      message: parts[0] || "Error",
      details: anyErr.errors?.length
        ? anyErr.errors
        : anyErr.parent?.message
          ? { sqlMessage: anyErr.parent.message }
          : undefined,
    };
  }
  return { message: String(error) };
}

class OrderController {
  public async createOrder(req: Request, res: Response): Promise<void> {
    const transaction = await sequelize.transaction();

    try {
      const user = (req as Request & { user?: AuthUser }).user;
      const customerId = user?.customerId;

      if (customerId == null || !Number.isInteger(customerId)) {
        await transaction.rollback();
        res.status(403).json({
          success: false,
          message:
            "Customer profile not linked to this account (customerId missing from token).",
        });
        return;
      }

      const rawItems = req.body?.items as unknown;
      if (!Array.isArray(rawItems) || rawItems.length === 0) {
        await transaction.rollback();
        res.status(400).json({
          success: false,
          message:
            'Body must include a non-empty "items" array ({ productId or pro_id, quantity }).',
        });
        return;
      }

      const customer = await Customer.findByPk(customerId, { transaction });
      if (!customer) {
        await transaction.rollback();
        res.status(404).json({
          success: false,
          message: "Customer not found",
        });
        return;
      }

      const lines: {
        productId: number;
        quantity: number;
        unitPrice: number;
        image: string | null;
      }[] = [];

      for (const row of rawItems) {
        if (row == null || typeof row !== "object") {
          await transaction.rollback();
          res.status(400).json({
            success: false,
            message: "Each item must be an object.",
          });
          return;
        }

        const rec = row as Record<string, unknown>;
        const rawId = rec.productId ?? rec.pro_id;
        const productId =
          typeof rawId === "string" ? parseInt(rawId, 10) : Number(rawId);
        const quantity = Math.floor(
          Number(rec.quantity != null ? rec.quantity : 1),
        );

        if (
          !Number.isInteger(productId) ||
          productId < 1 ||
          !Number.isInteger(quantity) ||
          quantity < 1
        ) {
          await transaction.rollback();
          res.status(400).json({
            success: false,
            message:
              "Each item needs a valid productId (or pro_id) and quantity >= 1.",
          });
          return;
        }

        const product = await Product.findByPk(productId, { transaction });
        if (!product) {
          await transaction.rollback();
          res.status(404).json({
            success: false,
            message: `Product with ID ${productId} not found`,
          });
          return;
        }

        const unit = Number(product.pro_price);
        if (!Number.isFinite(unit) || unit < 0) {
          await transaction.rollback();
          res.status(400).json({
            success: false,
            message: `Product "${product.pro_name ?? productId}" has no valid price`,
          });
          return;
        }

        const stock = product.pro_qty ?? 0;
        if (stock < quantity) {
          await transaction.rollback();
          res.status(400).json({
            success: false,
            message: `Insufficient stock for product ${product.pro_name}`,
          });
          return;
        }

        lines.push({
          productId,
          quantity,
          unitPrice: unit,
          image: product.pro_image ?? null,
        });
      }

      const totalPrice = lines.reduce(
        (sum, line) => sum + line.unitPrice * line.quantity,
        0,
      );

      const newOrder = await Order.create(
        {
          cus_id: customerId,
          pro_id: lines[0]!.productId,
          price: Math.round(Number(totalPrice)),
          date: new Date(),
          payment_status: "pending",
          shipping_status: "waiting",
        },
        { transaction },
      );

      for (const line of lines) {
        await BillSellDetail.create(
          {
            Order_id: newOrder.order_id,
            Pro_id: line.productId,
            qty: line.quantity,
            Total: Math.round(line.unitPrice * line.quantity),
            date: newOrder.date ?? new Date(),
            image: line.image,
          },
          { transaction },
        );
      }

      await transaction.commit();

      res.status(201).json({
        success: true,
        message: "Order created successfully",
        data: {
          orderId: newOrder.order_id,
          totalPrice: Math.round(Number(totalPrice)),
        },
      });
    } catch (error) {
      await transaction.rollback().catch(() => {});

      const { message, details } = serializeError(error);
      console.error("[createOrder]", error);

      res.status(500).json({
        success: false,
        message: "Failed to create order",
        error: { message, ...(details ? { details } : {}) },
      });
    }
  }

  public async getOrderDetails(req: Request, res: Response): Promise<void> {
    try {
      const orderId = parseInt((req.params as Record<string, string>).id, 10);
      if (isNaN(orderId)) {
        res.status(400).json({
          success: false,
          message: "Invalid order ID",
        });
        return;
      }

      const order = await Order.findByPk(orderId, {
        include: [
          {
            model: Customer,
            as: "customer",
          },
          {
            model: BillSellDetail,
            as: "billDetails",
            include: [
              {
                model: Product,
                as: "product",
              },
            ],
          },
        ],
      });
      if(!order) {
        res.status(404).json({
          success: false,
          message: "Order not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve order details",
        error: serializeError(error),
      });
    }
  }

  public async uploadPaymentReceipt(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to upload payment receipt",
        error: serializeError(error),
      });
    }
  }

  public async getReportOrder(req: Request, res: Response): Promise<void> {
    try {
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to generate order report",
        error: serializeError(error),
      });
    }
  }
}

export default new OrderController();
