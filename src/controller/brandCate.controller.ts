import "../models";
import { Request, Response } from "express";
import Brand from "../models/brand.model";
import BrandCategory from "../models/brandCategory.model";
import Category from "../models/category.model";

function serializeError(error: unknown): { message: string; details?: unknown } {
  if (error instanceof Error) return { message: error.message };
  return { message: String(error) };
}

function parsePositiveInt(value: unknown): number | null {
  const id = parseInt(String(value), 10);
  return Number.isInteger(id) && id > 0 ? id : null;
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

async function assertBrandExists(brandId: number): Promise<Brand> {
  const brand = await Brand.findByPk(brandId);
  if (!brand) throw new Error("Brand not found");
  return brand;
}

async function assertCategoryExists(cateId: number): Promise<Category> {
  const category = await Category.findByPk(cateId);
  if (!category) throw new Error("Category not found");
  return category;
}

async function replaceBrandCategories(
  brandId: number,
  cateIds: number[],
): Promise<void> {
  if (cateIds.length > 0) {
    const categories = await Category.findAll({ where: { cate_id: cateIds } });
    if (categories.length !== cateIds.length) {
      throw new Error("One or more category IDs are invalid");
    }
  }

  await BrandCategory.destroy({ where: { brand_id: brandId } });

  if (cateIds.length > 0) {
    await BrandCategory.bulkCreate(
      cateIds.map((cate_id) => ({ brand_id: brandId, cate_id })),
    );
  }
}

const linkIncludes = [
  { model: Brand, as: "brand" },
  { model: Category, as: "category" },
];

class BrandCateController {
  public async getAllLinks(req: Request, res: Response): Promise<void> {
    try {
      const links = await BrandCategory.findAll({
        include: linkIncludes,
        order: [
          ["brand_id", "ASC"],
          ["cate_id", "ASC"],
        ],
      });

      res.status(200).json({ success: true, data: links });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch brand-category links",
        error: serializeError(error),
      });
    }
  }

  public async getLinksByBrand(req: Request, res: Response): Promise<void> {
    try {
      const brandId = parsePositiveInt(req.params.brandId);
      if (!brandId) {
        res.status(400).json({ success: false, message: "Invalid brand ID" });
        return;
      }

      await assertBrandExists(brandId);

      const links = await BrandCategory.findAll({
        where: { brand_id: brandId },
        include: linkIncludes,
        order: [["cate_id", "ASC"]],
      });

      res.status(200).json({ success: true, data: links });
    } catch (error) {
      const status =
        error instanceof Error && error.message === "Brand not found" ? 404 : 500;
      res.status(status).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch links by brand",
        error: serializeError(error),
      });
    }
  }

  public async getLinksByCategory(req: Request, res: Response): Promise<void> {
    try {
      const cateId = parsePositiveInt(req.params.cateId);
      if (!cateId) {
        res.status(400).json({ success: false, message: "Invalid category ID" });
        return;
      }

      await assertCategoryExists(cateId);

      const links = await BrandCategory.findAll({
        where: { cate_id: cateId },
        include: linkIncludes,
        order: [["brand_id", "ASC"]],
      });

      res.status(200).json({ success: true, data: links });
    } catch (error) {
      const status =
        error instanceof Error && error.message === "Category not found"
          ? 404
          : 500;
      res.status(status).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch links by category",
        error: serializeError(error),
      });
    }
  }

  public async createLink(req: Request, res: Response): Promise<void> {
    try {
      const body = (req.body ?? {}) as Record<string, unknown>;
      const brandId = parsePositiveInt(body.brand_id ?? body.brandId);
      const cateId = parsePositiveInt(body.cate_id ?? body.cateId);

      if (!brandId || !cateId) {
        res.status(400).json({
          success: false,
          message: "brand_id and cate_id are required",
        });
        return;
      }

      await assertBrandExists(brandId);
      await assertCategoryExists(cateId);

      const [link, created] = await BrandCategory.findOrCreate({
        where: { brand_id: brandId, cate_id: cateId },
        defaults: { brand_id: brandId, cate_id: cateId },
      });

      const data = await BrandCategory.findOne({
        where: { brand_id: link.brand_id, cate_id: link.cate_id },
        include: linkIncludes,
      });

      res.status(created ? 201 : 200).json({
        success: true,
        message: created ? "Link created" : "Link already exists",
        data,
      });
    } catch (error) {
      const status =
        error instanceof Error &&
        (error.message === "Brand not found" || error.message === "Category not found")
          ? 404
          : 500;
      res.status(status).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to create link",
        error: serializeError(error),
      });
    }
  }

  public async setBrandCategories(req: Request, res: Response): Promise<void> {
    try {
      const brandId = parsePositiveInt(req.params.brandId);
      if (!brandId) {
        res.status(400).json({ success: false, message: "Invalid brand ID" });
        return;
      }

      await assertBrandExists(brandId);

      const body = (req.body ?? {}) as Record<string, unknown>;
      const cateIds = parseCateIds(body.cate_ids ?? body.cateIds);

      if (cateIds === undefined) {
        res.status(400).json({
          success: false,
          message: "cate_ids is required (array, JSON string, or comma-separated)",
        });
        return;
      }

      await replaceBrandCategories(brandId, cateIds);

      const links = await BrandCategory.findAll({
        where: { brand_id: brandId },
        include: linkIncludes,
        order: [["cate_id", "ASC"]],
      });

      res.status(200).json({ success: true, data: links });
    } catch (error) {
      const status =
        error instanceof Error &&
        (error.message === "Brand not found" ||
          error.message.includes("category"))
          ? error.message === "Brand not found"
            ? 404
            : 400
          : 500;
      res.status(status).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to set brand categories",
        error: serializeError(error),
      });
    }
  }

  public async deleteLink(req: Request, res: Response): Promise<void> {
    try {
      const brandId = parsePositiveInt(req.params.brandId);
      const cateId = parsePositiveInt(req.params.cateId);

      if (!brandId || !cateId) {
        res.status(400).json({
          success: false,
          message: "Invalid brand ID or category ID",
        });
        return;
      }

      const deleted = await BrandCategory.destroy({
        where: { brand_id: brandId, cate_id: cateId },
      });

      if (!deleted) {
        res.status(404).json({ success: false, message: "Link not found" });
        return;
      }

      res
        .status(200)
        .json({ success: true, message: "Link removed successfully" });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to delete link",
        error: serializeError(error),
      });
    }
  }
}

export default new BrandCateController();
