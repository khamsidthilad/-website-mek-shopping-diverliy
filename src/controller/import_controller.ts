import { Request, Response } from "express";
import Purchase from "../models/importProdcut.model";
import User from "../models/user.model";

function serializeError(error: unknown): { message: string; details?: unknown } {
  if (error instanceof Error) return { message: error.message };
  return { message: String(error) };
}

class ImportController {
  public async getAllImports(req: Request, res: Response): Promise<void> {
    try {
      const imports = await Purchase.findAll({
        include: [{ model: User, as: "user", attributes: ["User_id", "Full_Name", "Email", "role"] }],
        order: [["Purchase_id", "DESC"]],
      });

      res.status(200).json({ success: true, data: imports });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch import records",
        error: serializeError(error),
      });
    }
  }

  public async getImportById(req: Request, res: Response): Promise<void> {
    try {
      const purchaseId = parseInt(String(req.params.id), 10);
      if (!Number.isInteger(purchaseId) || purchaseId < 1) {
        res.status(400).json({ success: false, message: "Invalid import ID" });
        return;
      }

      const record = await Purchase.findByPk(purchaseId, {
        include: [{ model: User, as: "user", attributes: ["User_id", "Full_Name", "Email", "role"] }],
      });
      if (!record) {
        res.status(404).json({ success: false, message: "Import record not found" });
        return;
      }

      res.status(200).json({ success: true, data: record });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch import record",
        error: serializeError(error),
      });
    }
  }

  public async createImport(req: Request, res: Response): Promise<void> {
    try {
      const authUser = (req as Request & { user?: { id: string } }).user;
      const user_id =
        req.body?.user_id !== undefined && req.body?.user_id !== ""
          ? String(req.body.user_id)
          : authUser?.id ?? null;

      if (user_id) {
        const user = await User.findByPk(user_id);
        if (!user) {
          res.status(400).json({ success: false, message: "User not found for user_id" });
          return;
        }
      }

      const record = await Purchase.create({ user_id });

      res.status(201).json({ success: true, data: record });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to create import record",
        error: serializeError(error),
      });
    }
  }

  public async updateImport(req: Request, res: Response): Promise<void> {
    try {
      const purchaseId = parseInt(String(req.params.id), 10);
      if (!Number.isInteger(purchaseId) || purchaseId < 1) {
        res.status(400).json({ success: false, message: "Invalid import ID" });
        return;
      }

      const record = await Purchase.findByPk(purchaseId);
      if (!record) {
        res.status(404).json({ success: false, message: "Import record not found" });
        return;
      }

      const { user_id } = req.body ?? {};
      if (user_id !== undefined && user_id !== null && user_id !== "") {
        const user = await User.findByPk(String(user_id));
        if (!user) {
          res.status(400).json({ success: false, message: "User not found for user_id" });
          return;
        }
        await record.update({ user_id: String(user_id) });
      } else if (user_id === null || user_id === "") {
        await record.update({ user_id: null });
      }

      res.status(200).json({ success: true, data: record });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to update import record",
        error: serializeError(error),
      });
    }
  }

  public async deleteImport(req: Request, res: Response): Promise<void> {
    try {
      const purchaseId = parseInt(String(req.params.id), 10);
      if (!Number.isInteger(purchaseId) || purchaseId < 1) {
        res.status(400).json({ success: false, message: "Invalid import ID" });
        return;
      }

      const record = await Purchase.findByPk(purchaseId);
      if (!record) {
        res.status(404).json({ success: false, message: "Import record not found" });
        return;
      }

      await record.destroy();
      res
        .status(200)
        .json({ success: true, message: "Import record deleted successfully" });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to delete import record",
        error: serializeError(error),
      });
    }
  }
}

export default new ImportController();
