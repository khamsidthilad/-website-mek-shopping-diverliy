import "../models";
import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import Brand from "../models/brand.model";
import BrandCategory from "../models/brandCategory.model";
import Category from "../models/category.model";
import Product from "../models/product.model";

function serializeError(error: unknown): { message: string; details?: unknown } {
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

function parseCateIds(value: unknown): number[] | undefined {
  if (value === undefined || value === null || value === "") return undefined;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    if (trimmed === "[]") return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .map((id) => parseInt(String(id), 10))
          .filter((id) => Number.isInteger(id) && id > 0);
      }
    } catch {
      const ids = trimmed
        .split(",")
        .map((id) => parseInt(id.trim(), 10))
        .filter((id) => Number.isInteger(id) && id > 0);
      return ids.length > 0 ? ids : undefined;
    }
  }

  if (Array.isArray(value)) {
    return value
      .map((id) => parseInt(String(id), 10))
      .filter((id) => Number.isInteger(id) && id > 0);
  }

  const single = parseInt(String(value), 10);
  return Number.isInteger(single) && single > 0 ? [single] : undefined;
}

function brandLogoPath(req: Request): string | null {
  if (!req.file) return null;
  return `images/brands/${req.file.filename}`;
}

function removeBrandLogoFile(logoPath: string | null): void {
  if (!logoPath) return;
  const fullPath = path.join(__dirname, "../../public", logoPath);
  if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
}

async function syncBrandCategories(
  brand: Brand,
  cateIds: number[],
): Promise<void> {
  if (cateIds.length > 0) {
    const categories = await Category.findAll({
      where: { cate_id: cateIds },
    });

    if (categories.length !== cateIds.length) {
      throw new Error("One or more category IDs are invalid");
    }
  }

  await BrandCategory.destroy({ where: { brand_id: brand.brand_id } });

  if (cateIds.length > 0) {
    await BrandCategory.bulkCreate(
      cateIds.map((cate_id) => ({ brand_id: brand.brand_id, cate_id })),
    );
  }
}

const brandIncludes = [
  { model: Category, as: "categories", through: { attributes: [] } },
  { model: Product, as: "products" },
];

class BrandController {
  public async getAllBrands(req: Request, res: Response): Promise<void> {
    try {
      const brands = await Brand.findAll({
        include: brandIncludes,
        order: [["brand_id", "DESC"]],
      });

      res.status(200).json({ success: true, data: brands });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch brands",
        error: serializeError(error),
      });
    }
  }

  public async getBrandById(req: Request, res: Response): Promise<void> {
    try {
      const brandId = parseInt(String(req.params.id), 10);
      if (!Number.isInteger(brandId) || brandId < 1) {
        res.status(400).json({ success: false, message: "Invalid brand ID" });
        return;
      }

      const brand = await Brand.findByPk(brandId, { include: brandIncludes });
      if (!brand) {
        res.status(404).json({ success: false, message: "Brand not found" });
        return;
      }

      res.status(200).json({ success: true, data: brand });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch brand",
        error: serializeError(error),
      });
    }
  }

  public async createBrand(req: Request, res: Response): Promise<void> {
    try {
      const body = (req.body ?? {}) as Record<string, unknown>;
      const cate_ids = formField(body, "cate_ids", "cateIds");

      const brand = await Brand.create({
        name: formString(body, "name", "NAME"),
        tagline: formString(body, "tagline", "TAGLINE"),
        country: formString(body, "country", "COUNTRY"),
        brand_logo: brandLogoPath(req),
      });

      const categoryIds = parseCateIds(cate_ids);
      if (categoryIds !== undefined) {
        await syncBrandCategories(brand, categoryIds);
      }

      const created = await Brand.findByPk(brand.brand_id, { include: brandIncludes });
      res.status(201).json({ success: true, data: created });
    } catch (error) {
      const message =
        error instanceof Error && error.message.includes("category")
          ? error.message
          : "Failed to create brand";
      res.status(500).json({
        success: false,
        message,
        error: serializeError(error),
      });
    }
  }

  public async updateBrand(req: Request, res: Response): Promise<void> {
    try {
      const brandId = parseInt(String(req.params.id), 10);
      if (!Number.isInteger(brandId) || brandId < 1) {
        res.status(400).json({ success: false, message: "Invalid brand ID" });
        return;
      }

      const brand = await Brand.findByPk(brandId);
      if (!brand) {
        res.status(404).json({ success: false, message: "Brand not found" });
        return;
      }

      const body = (req.body ?? {}) as Record<string, unknown>;
      const name = formField(body, "name", "NAME");
      const tagline = formField(body, "tagline", "TAGLINE");
      const country = formField(body, "country", "COUNTRY");
      const cate_ids = formField(body, "cate_ids", "cateIds");
      const newLogo = brandLogoPath(req);

      if (newLogo && brand.brand_logo) {
        removeBrandLogoFile(brand.brand_logo);
      }

      await brand.update({
        name: name !== undefined ? formString(body, "name", "NAME") : brand.name,
        tagline:
          tagline !== undefined ? formString(body, "tagline", "TAGLINE") : brand.tagline,
        country:
          country !== undefined ? formString(body, "country", "COUNTRY") : brand.country,
        brand_logo: newLogo ?? brand.brand_logo,
      });

      const categoryIds = parseCateIds(cate_ids);
      if (categoryIds !== undefined) {
        await syncBrandCategories(brand, categoryIds);
      }

      const updated = await Brand.findByPk(brandId, { include: brandIncludes });
      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      const message =
        error instanceof Error && error.message.includes("category")
          ? error.message
          : "Failed to update brand";
      res.status(500).json({
        success: false,
        message,
        error: serializeError(error),
      });
    }
  }

  public async deleteBrand(req: Request, res: Response): Promise<void> {
    try {
      const brandId = parseInt(String(req.params.id), 10);
      if (!Number.isInteger(brandId) || brandId < 1) {
        res.status(400).json({ success: false, message: "Invalid brand ID" });
        return;
      }

      const brand = await Brand.findByPk(brandId);
      if (!brand) {
        res.status(404).json({ success: false, message: "Brand not found" });
        return;
      }

      removeBrandLogoFile(brand.brand_logo);
      await brand.destroy();
      res
        .status(200)
        .json({ success: true, message: "Brand deleted successfully" });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to delete brand",
        error: serializeError(error),
      });
    }
  }
}

export default new BrandController();
