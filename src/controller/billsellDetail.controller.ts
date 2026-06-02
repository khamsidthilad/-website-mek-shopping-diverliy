import { Request, Response } from "express";
import BillSellDetail from "../models/billSellDetail.model";
import Product from "../models/product.model";
import Order from "../models/order.model";

function serializeError(error: unknown): { message: string; details?: unknown } {
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

class BillSellDetailController {
  public async getAllBillSellDetails(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const details = await BillSellDetail.findAll({
        include: [
          { model: Product, as: "product" },
          { model: Order, as: "order" },
        ],
        order: [["detail_id", "DESC"]],
      });

      res.status(200).json({
        success: true,
        data: details,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch bill sell details",
        error: serializeError(error),
      });
    }
  }

  public async getBillSellDetailById(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const rawId = (req.params as Record<string, string>).id;
      const detailId = parseInt(rawId, 10);
      if (!Number.isInteger(detailId) || detailId < 1) {
        res.status(400).json({
          success: false,
          message: "Invalid detail ID",
        });
        return;
      }

      const detail = await BillSellDetail.findByPk(detailId, {
        include: [
          { model: Product, as: "product" },
          { model: Order, as: "order" },
        ],
      });

      if (!detail) {
        res.status(404).json({
          success: false,
          message: "Bill sell detail not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: detail,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch bill sell detail",
        error: serializeError(error),
      });
    }
  }

  public async getBillSellDetailsByOrderId(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const raw = (req.params as Record<string, string>).orderId ?? req.params.id;
      const orderId = parseInt(String(raw), 10);
      if (!Number.isInteger(orderId) || orderId < 1) {
        res.status(400).json({
          success: false,
          message: "Invalid order ID",
        });
        return;
      }

      const details = await BillSellDetail.findAll({
        where: { Order_id: orderId },
        include: [{ model: Product, as: "product" }],
        order: [["detail_id", "ASC"]],
      });

      res.status(200).json({
        success: true,
        data: details,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch bill sell details for order",
        error: serializeError(error),
      });
    }
  }

  public async createBillSellDetail(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { Order_id, Pro_id, qty, Total, date, image } = req.body ?? {};

      const created = await BillSellDetail.create({
        Order_id: Order_id ?? null,
        Pro_id: Pro_id ?? null,
        qty: qty ?? null,
        Total: Total ?? null,
        date: date ?? null,
        image: image ?? null,
      });

      res.status(201).json({
        success: true,
        data: created,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to create bill sell detail",
        error: serializeError(error),
      });
    }
  }

  public async updateBillSellDetail(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const rawId = (req.params as Record<string, string>).id;
      const detailId = parseInt(rawId, 10);
      if (!Number.isInteger(detailId) || detailId < 1) {
        res.status(400).json({
          success: false,
          message: "Invalid detail ID",
        });
        return;
      }

      const detail = await BillSellDetail.findByPk(detailId);
      if (!detail) {
        res.status(404).json({
          success: false,
          message: "Bill sell detail not found",
        });
        return;
      }

      const { Order_id, Pro_id, qty, Total, date, image } = req.body ?? {};

      await detail.update({
        Order_id: Order_id ?? detail.Order_id,
        Pro_id: Pro_id ?? detail.Pro_id,
        qty: qty ?? detail.qty,
        Total: Total ?? detail.Total,
        date: date ?? detail.date,
        image: image ?? detail.image,
      });

      res.status(200).json({
        success: true,
        data: detail,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to update bill sell detail",
        error: serializeError(error),
      });
    }
  }

  public async deleteBillSellDetail(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const rawId = (req.params as Record<string, string>).id;
      const detailId = parseInt(rawId, 10);
      if (!Number.isInteger(detailId) || detailId < 1) {
        res.status(400).json({
          success: false,
          message: "Invalid detail ID",
        });
        return;
      }

      const detail = await BillSellDetail.findByPk(detailId);
      if (!detail) {
        res.status(404).json({
          success: false,
          message: "Bill sell detail not found",
        });
        return;
      }

      await detail.destroy();

      res.status(200).json({
        success: true,
        message: "Bill sell detail deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to delete bill sell detail",
        error: serializeError(error),
      });
    }
  }
}

export default new BillSellDetailController();
