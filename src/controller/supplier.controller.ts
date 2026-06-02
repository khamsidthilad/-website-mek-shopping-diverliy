import { Request, Response } from "express";
import Supplier from "../models/supplier.model";
import Product from "../models/product.model";

function serializeError(error: unknown): { message: string; details?: unknown } {
  if (error instanceof Error) return { message: error.message };
  return { message: String(error) };
}

class SupplierController {
  public async getAllSuppliers(req: Request, res: Response): Promise<void> {
    try {
      const suppliers = await Supplier.findAll({
        include: [{ model: Product, as: "product" }],
        order: [["sup_id", "DESC"]],
      });

      res.status(200).json({ success: true, data: suppliers });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch suppliers",
        error: serializeError(error),
      });
    }
  }

  public async getSupplierById(req: Request, res: Response): Promise<void> {
    try {
      const supplierId = parseInt(String(req.params.id), 10);
      if (!Number.isInteger(supplierId) || supplierId < 1) {
        res.status(400).json({ success: false, message: "Invalid supplier ID" });
        return;
      }

      const supplier = await Supplier.findByPk(supplierId, {
        include: [{ model: Product, as: "product" }],
      });
      if (!supplier) {
        res.status(404).json({ success: false, message: "Supplier not found" });
        return;
      }

      res.status(200).json({ success: true, data: supplier });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch supplier",
        error: serializeError(error),
      });
    }
  }

  public async createSupplier(req: Request, res: Response): Promise<void> {
    try {
      const { name, Tel, address, pro_id } = req.body ?? {};

      const supplier = await Supplier.create({
        name: name ?? null,
        Tel: Tel ?? null,
        address: address ?? null,
        pro_id: pro_id ?? null,
      });

      res.status(201).json({ success: true, data: supplier });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to create supplier",
        error: serializeError(error),
      });
    }
  }

  public async updateSupplier(req: Request, res: Response): Promise<void> {
    try {
      const supplierId = parseInt(String(req.params.id), 10);
      if (!Number.isInteger(supplierId) || supplierId < 1) {
        res.status(400).json({ success: false, message: "Invalid supplier ID" });
        return;
      }

      const supplier = await Supplier.findByPk(supplierId);
      if (!supplier) {
        res.status(404).json({ success: false, message: "Supplier not found" });
        return;
      }

      const { name, Tel, address, pro_id } = req.body ?? {};
      await supplier.update({
        name: name ?? supplier.name,
        Tel: Tel ?? supplier.Tel,
        address: address ?? supplier.address,
        pro_id: pro_id ?? supplier.pro_id,
      });

      res.status(200).json({ success: true, data: supplier });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to update supplier",
        error: serializeError(error),
      });
    }
  }

  public async deleteSupplier(req: Request, res: Response): Promise<void> {
    try {
      const supplierId = parseInt(String(req.params.id), 10);
      if (!Number.isInteger(supplierId) || supplierId < 1) {
        res.status(400).json({ success: false, message: "Invalid supplier ID" });
        return;
      }

      const supplier = await Supplier.findByPk(supplierId);
      if (!supplier) {
        res.status(404).json({ success: false, message: "Supplier not found" });
        return;
      }

      await supplier.destroy();
      res
        .status(200)
        .json({ success: true, message: "Supplier deleted successfully" });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to delete supplier",
        error: serializeError(error),
      });
    }
  }
}

export default new SupplierController();
