import { Request, Response } from 'express';
import Purchase from '../models/importProdcut.model';
import User from '../models/user.model';
import Product from '../models/product.model';
import Supplier from '../models/supplier.model';
import { sequelize } from '../models';

function serializeError(error: unknown): { message: string; details?: unknown } {
  if (error instanceof Error) return { message: error.message };
  return { message: String(error) };
}

function toNumber(value: unknown): number {
  if (value == null || value === '') return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

const importIncludes = [
  { model: User, as: 'user', attributes: ['User_id', 'Full_Name', 'Email', 'role'] },
  { model: Product, as: 'product' },
  { model: Supplier, as: 'supplier' },
];

class ImportController {
  public async getAllImports(req: Request, res: Response): Promise<void> {
    try {
      const imports = await Purchase.findAll({
        include: importIncludes,
        order: [['Purchase_id', 'DESC']],
      });

      res.status(200).json({ success: true, data: imports });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch import records',
        error: serializeError(error),
      });
    }
  }

  public async getImportById(req: Request, res: Response): Promise<void> {
    try {
      const purchaseId = parseInt(String(req.params.id), 10);
      if (!Number.isInteger(purchaseId) || purchaseId < 1) {
        res.status(400).json({ success: false, message: 'Invalid import ID' });
        return;
      }

      const record = await Purchase.findByPk(purchaseId, { include: importIncludes });
      if (!record) {
        res.status(404).json({ success: false, message: 'Import record not found' });
        return;
      }

      res.status(200).json({ success: true, data: record });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch import record',
        error: serializeError(error),
      });
    }
  }

  public async createImport(req: Request, res: Response): Promise<void> {
    const transaction = await sequelize.transaction();

    try {
      const authUser = (req as Request & { user?: { id: string } }).user;
      const pro_id = parseInt(String(req.body?.pro_id), 10);
      const sup_id = parseInt(String(req.body?.sup_id), 10);
      const quantity = parseInt(String(req.body?.quantity), 10);
      const price = toNumber(req.body?.price);

      if (!Number.isInteger(pro_id) || pro_id < 1) {
        await transaction.rollback();
        res.status(400).json({ success: false, message: 'A valid product is required' });
        return;
      }

      if (!Number.isInteger(sup_id) || sup_id < 1) {
        await transaction.rollback();
        res.status(400).json({ success: false, message: 'A valid supplier is required' });
        return;
      }

      if (!Number.isInteger(quantity) || quantity < 1) {
        await transaction.rollback();
        res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
        return;
      }

      if (price < 0) {
        await transaction.rollback();
        res.status(400).json({ success: false, message: 'Price cannot be negative' });
        return;
      }

      const product = await Product.findByPk(pro_id, { transaction });
      if (!product) {
        await transaction.rollback();
        res.status(404).json({ success: false, message: 'Product not found' });
        return;
      }

      const supplier = await Supplier.findByPk(sup_id, { transaction });
      if (!supplier) {
        await transaction.rollback();
        res.status(404).json({ success: false, message: 'Supplier not found' });
        return;
      }

      const user_id = authUser?.id ?? null;
      if (user_id) {
        const user = await User.findByPk(user_id, { transaction });
        if (!user) {
          await transaction.rollback();
          res.status(400).json({ success: false, message: 'User not found for user_id' });
          return;
        }
      }

      const record = await Purchase.create(
        {
          user_id,
          pro_id,
          sup_id,
          quantity,
          price,
        },
        { transaction },
      );

      await product.update(
        { pro_qty: (product.pro_qty ?? 0) + quantity },
        { transaction },
      );

      await transaction.commit();

      const created = await Purchase.findByPk(record.Purchase_id, { include: importIncludes });
      res.status(201).json({ success: true, data: created });
    } catch (error) {
      await transaction.rollback();
      res.status(500).json({
        success: false,
        message: 'Failed to create import record',
        error: serializeError(error),
      });
    }
  }

  public async updateImport(req: Request, res: Response): Promise<void> {
    const transaction = await sequelize.transaction();

    try {
      const purchaseId = parseInt(String(req.params.id), 10);
      if (!Number.isInteger(purchaseId) || purchaseId < 1) {
        await transaction.rollback();
        res.status(400).json({ success: false, message: 'Invalid import ID' });
        return;
      }

      const record = await Purchase.findByPk(purchaseId, { transaction });
      if (!record) {
        await transaction.rollback();
        res.status(404).json({ success: false, message: 'Import record not found' });
        return;
      }

      const nextProId =
        req.body?.pro_id !== undefined ? parseInt(String(req.body.pro_id), 10) : record.pro_id;
      const nextSupId =
        req.body?.sup_id !== undefined ? parseInt(String(req.body.sup_id), 10) : record.sup_id;
      const nextQuantity =
        req.body?.quantity !== undefined
          ? parseInt(String(req.body.quantity), 10)
          : (record.quantity ?? 0);
      const nextPrice =
        req.body?.price !== undefined ? toNumber(req.body.price) : toNumber(record.price);

      if (nextProId == null || !Number.isInteger(nextProId) || nextProId < 1) {
        await transaction.rollback();
        res.status(400).json({ success: false, message: 'A valid product is required' });
        return;
      }

      if (nextSupId == null || !Number.isInteger(nextSupId) || nextSupId < 1) {
        await transaction.rollback();
        res.status(400).json({ success: false, message: 'A valid supplier is required' });
        return;
      }

      if (!Number.isInteger(nextQuantity) || nextQuantity < 1) {
        await transaction.rollback();
        res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
        return;
      }

      if (nextPrice < 0) {
        await transaction.rollback();
        res.status(400).json({ success: false, message: 'Price cannot be negative' });
        return;
      }

      const oldProduct = record.pro_id
        ? await Product.findByPk(record.pro_id, { transaction })
        : null;
      const newProduct = await Product.findByPk(nextProId as number, { transaction });
      if (!newProduct) {
        await transaction.rollback();
        res.status(404).json({ success: false, message: 'Product not found' });
        return;
      }

      const supplier = await Supplier.findByPk(nextSupId as number, { transaction });
      if (!supplier) {
        await transaction.rollback();
        res.status(404).json({ success: false, message: 'Supplier not found' });
        return;
      }

      const oldQuantity = record.quantity ?? 0;
      if (oldProduct && record.pro_id === nextProId) {
        const stockDelta = nextQuantity - oldQuantity;
        const currentStock = oldProduct.pro_qty ?? 0;
        if (currentStock + stockDelta < 0) {
          await transaction.rollback();
          res.status(400).json({
            success: false,
            message: 'Cannot reduce stock below zero for this product',
          });
          return;
        }
        await oldProduct.update({ pro_qty: currentStock + stockDelta }, { transaction });
      } else {
        if (oldProduct) {
          await oldProduct.update(
            { pro_qty: Math.max(0, (oldProduct.pro_qty ?? 0) - oldQuantity) },
            { transaction },
          );
        }
        await newProduct.update(
          { pro_qty: (newProduct.pro_qty ?? 0) + nextQuantity },
          { transaction },
        );
      }

      await record.update(
        {
          pro_id: nextProId,
          sup_id: nextSupId,
          quantity: nextQuantity,
          price: nextPrice,
        },
        { transaction },
      );

      await transaction.commit();

      const updated = await Purchase.findByPk(record.Purchase_id, { include: importIncludes });
      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      await transaction.rollback();
      res.status(500).json({
        success: false,
        message: 'Failed to update import record',
        error: serializeError(error),
      });
    }
  }

  public async deleteImport(req: Request, res: Response): Promise<void> {
    const transaction = await sequelize.transaction();

    try {
      const purchaseId = parseInt(String(req.params.id), 10);
      if (!Number.isInteger(purchaseId) || purchaseId < 1) {
        await transaction.rollback();
        res.status(400).json({ success: false, message: 'Invalid import ID' });
        return;
      }

      const record = await Purchase.findByPk(purchaseId, { transaction });
      if (!record) {
        await transaction.rollback();
        res.status(404).json({ success: false, message: 'Import record not found' });
        return;
      }

      if (record.pro_id && (record.quantity ?? 0) > 0) {
        const product = await Product.findByPk(record.pro_id, { transaction });
        if (product) {
          const nextQty = Math.max(0, (product.pro_qty ?? 0) - (record.quantity ?? 0));
          await product.update({ pro_qty: nextQty }, { transaction });
        }
      }

      await record.destroy({ transaction });
      await transaction.commit();

      res.status(200).json({ success: true, message: 'Import record deleted successfully' });
    } catch (error) {
      await transaction.rollback();
      res.status(500).json({
        success: false,
        message: 'Failed to delete import record',
        error: serializeError(error),
      });
    }
  }
}

export default new ImportController();
