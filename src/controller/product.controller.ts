import { Request, Response } from "express";
import Category from "../models/category.model";
import Brand from "../models/brand.model";
import Product from "../models/product.model";
import { Op } from "sequelize";
import path from "path";
import fs from "fs";

function serializeError(error: unknown): { message: string } {
  if (error instanceof Error) return { message: error.message };
  return { message: String(error) };
}

function formField(body: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    const value = body[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

function formString(body: Record<string, unknown>, ...keys: string[]): string | null {
  const value = formField(body, ...keys);
  if (value === undefined) return null;
  return String(value);
}

function parseOptionalInt(value: unknown): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  const parsed = parseInt(String(value), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function parseOptionalDecimal(value: unknown): number | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  const parsed = Number(String(value));
  return Number.isFinite(parsed) ? parsed : null;
}

function productImagePath(req: Request): string | null {
  if (!req.file) return null;
  return `images/products/${req.file.filename}`;
}

function removeProductImageFile(imagePath: string | null): void {
  if (!imagePath) return;
  const fullPath = path.join(__dirname, "../../public", imagePath);
  if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
}

class ProductController {
  public async getAllProducts(req: Request, res: Response): Promise<void> {
    try {
      const products = await Product.findAll({
        include: [
          { model: Category, as: "category" },
          { model: Brand, as: "brand" },
        ],
      });
      res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch products",
        error,
      });
    }
  }

  public async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const productId = Number(id);

      // Validate that id is a valid number
      if (isNaN(productId)) {
        res.status(400).json({
          success: false,
          message: "Invalid product ID",
        });
        return;
      }

      const products = await Product.findByPk(productId, {
        include: [
          { model: Category, as: "category" },
          { model: Brand, as: "brand" },
        ],
      });
      if (!products) {
        res.status(404).json({
          success: false,
          message: "Product not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch product",
        error,
      });
    }
  }

  public async searchProducts(req: Request, res: Response): Promise<void> {
    try {
      const { term } = req.query;
      const products = await Product.findAll({
        where: {
          pro_name: {
            [Op.like]: `%${term}%`,
          },
        },
        include: [
          { model: Category, as: "category" },
          { model: Brand, as: "brand" },
        ],
      });
      res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to search products",
        error,
      });
    }
  }

  public async createProduct(req: Request, res: Response): Promise<void> {
    try {
      const body = (req.body ?? {}) as Record<string, unknown>;

      const newProduct = await Product.create({
        pro_name: formString(body, "pro_name", "proName", "PRO_NAME"),
        pro_detail: formString(body, "pro_detail", "proDetail", "PRO_DETAIL"),
        pro_price: parseOptionalDecimal(formField(body, "pro_price", "proPrice", "PRO_PRICE")) ?? null,
        pro_qty: parseOptionalInt(formField(body, "pro_qty", "proQty", "PRO_QTY")) ?? 0,
        pro_image: productImagePath(req),
        cate_id: parseOptionalInt(formField(body, "cate_id", "cateId", "CATE_ID")) ?? null,
        brand_id: parseOptionalInt(formField(body, "brand_id", "brandId", "BRAND_ID")) ?? null,
      });

      res.status(201).json({
        success: true,
        data: newProduct,
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch product",
        error,
      });
    }
  }
  public async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      const productId = parseInt(String(req.params.id), 10);
      if (!Number.isInteger(productId) || productId < 1) {
        res.status(400).json({
          success: false,
          message: "Invalid product ID",
        });
        return;
      }

      const product = await Product.findByPk(productId, {
        include: [
          { model: Category, as: "category" },
          { model: Brand, as: "brand" },
        ],
      });
      if (!product) {
        res.status(404).json({
          success: false,
          message: "Product not found",
        });
        return;
      }

      const body = (req.body ?? {}) as Record<string, unknown>;
      const pro_name = formField(body, "pro_name", "proName", "PRO_NAME");
      const pro_detail = formField(body, "pro_detail", "proDetail", "PRO_DETAIL");
      const pro_price = formField(body, "pro_price", "proPrice", "PRO_PRICE");
      const pro_qty = formField(body, "pro_qty", "proQty", "PRO_QTY");
      const cate_id = formField(body, "cate_id", "cateId", "CATE_ID");
      const brand_id = formField(body, "brand_id", "brandId", "BRAND_ID");
      const newImage = productImagePath(req);

      if (newImage && product.pro_image) {
        removeProductImageFile(product.pro_image);
      }

      await product.update({
        pro_name:
          pro_name !== undefined
            ? formString(body, "pro_name", "proName", "PRO_NAME")
            : product.pro_name,
        pro_detail:
          pro_detail !== undefined
            ? formString(body, "pro_detail", "proDetail", "PRO_DETAIL")
            : product.pro_detail,
        pro_price:
          pro_price !== undefined
            ? parseOptionalDecimal(pro_price) ?? product.pro_price
            : product.pro_price,
        pro_qty:
          pro_qty !== undefined
            ? parseOptionalInt(pro_qty) ?? product.pro_qty
            : product.pro_qty,
        pro_image: newImage ?? product.pro_image,
        cate_id:
          cate_id !== undefined
            ? parseOptionalInt(cate_id) ?? product.cate_id
            : product.cate_id,
        brand_id:
          brand_id !== undefined
            ? parseOptionalInt(brand_id) ?? product.brand_id
            : product.brand_id,
      });

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to update product",
        error: serializeError(error),
      });
    }
  }
  public async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const productId = Number(id);

      if (isNaN(productId)) {
        res.status(400).json({
          success: false,
          message: "Invalid product ID",
        });
        return;
      }

      const product = await Product.findByPk(productId);

      if (!product) {
        res.status(404).json({
          success: false,
          message: "Product not found",
        });
        return;
      }

      if (product.pro_image) {
        const imagePath = path.join(__dirname, "../../public", product.pro_image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      await product.destroy();

      res.status(200).json({
        success: true,
        message: "Product deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to delete product",
        error,
      });
    }
  }
}
export default new ProductController();
