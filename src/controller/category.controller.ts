import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import Category from "../models/category.model";
import { Op } from "sequelize";
import { Product } from "../models";

function categoryImagePath(req: Request): string | null {
  if (!req.file) return null;
  return `images/categories/${req.file.filename}`;
}

function removeCategoryImageFile(imagePath: string | null): void {
  if (!imagePath) return;
  const fullPath = path.join(__dirname, "../../public", imagePath);
  if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
}

class CategoryController {
  public async getAllCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await Category.findAll();

      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve categories",
        error,
      });
    }
  }

  public async getCategoryById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const numberId = Number(id);
      if (isNaN(numberId)) {
        res.status(400).json({
          success: false,
          message: "Invalid category ID",
        });
        return;
      }
      const category = await Category.findByPk(numberId);
      if (!category) {
        res.status(404).json({
          success: false,
          message: "Category not found",
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: category,
        message: "Category retrieved successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve category",
        error,
      });
    }
  }

  public async searchCategories(req: Request, res: Response): Promise<void> {
    try {
      const term =
        typeof req.query.term === "string" ? req.query.term : req.params.term;
      if (!term) {
        res.status(400).json({
          success: false,
          message: "Search term is required",
        });
        return;
      }

      const categories = await Category.findAll({
        where: {
          cate_name: {
            [Op.like]: `%${term}%`,
          },
        },
      });
      res.status(200).json({
        success: true,
        data: categories,
        message: "Categories retrieved successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to search categories",
        error,
      });
    }
  }

  public async getProductsByCategory(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const { id } = req.params;
      const categoryId = Number(id);

      if (isNaN(categoryId)) {
        res.status(400).json({
          success: false,
          message: "Invalid category ID",
        });
        return;
      }
      const category = await Category.findByPk(categoryId);
      if (!category) {
        res.status(404).json({
          success: false,
          message: "Category not found",
        });
        return;
      }
      const products = await Product.findAll({
        where: { cate_id: categoryId },
        order: [["pro_name", "DESC"]],
      });
      res.status(200).json({
        success: true,
        data: {
          category: category,
          products: products,
        },
        message: "Products retrieved successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve products for category",
        error,
      });
    }
  }

  public async createCategory(req: Request, res: Response): Promise<void> {
    try {
      const { cate_name } = req.body;
      if (!cate_name) {
        res.status(400).json({
          success: false,
          message: "Category name is required",
        });
        return;
      }

      const existingCategory = await Category.findOne({
        where: { cate_name },
      });

      if (existingCategory) {
        res.status(400).json({
          success: false,
          message: "Category with this name already exists",
        });
        return;
      }

      const category = await Category.create({
        cate_name,
        cate_image: categoryImagePath(req),
      });

      res.status(201).json({
        success: true,
        message: "Category created successfully",
        data: category,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to create category",
        error,
      });
    }
  }

  public async updatecategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { cate_name } = req.body;
      const categoryId = Number(id);

      if (isNaN(categoryId)) {
        res.status(400).json({
          success: false,
          message: "Invalid category ID",
        });
        return;
      }
      const category = await Category.findByPk(categoryId);
      if (!category) {
        res.status(404).json({
          success: false,
          message: "Category not found",
        });
        return;
      }
      if (cate_name && cate_name !== category.cate_name) {
        const existingCategory = await Category.findOne({
          where: { cate_name },
        });

        if (existingCategory) {
          res.status(400).json({
            success: false,
            message: "Category with this name already exists",
          });
          return;
        }
      }

      const newImage = categoryImagePath(req);
      if (newImage && category.cate_image) {
        removeCategoryImageFile(category.cate_image);
      }

      await category.update({
        cate_name: cate_name || category.cate_name,
        cate_image: newImage ?? category.cate_image,
      });
      res.status(200).json({
        success: true,
        data: category,
        message: "Category updated successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to update category",
        error,
      });
    }
  }

  public async deleteCategory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const categoryId = Number(id);
      if (isNaN(categoryId)) {
        res.status(400).json({
          success: false,
          message: "Invalid category ID",
        });
        return;
      }
      const category = await Category.findByPk(categoryId);
      if (!category) {
        res.status(404).json({
          success: false,
          message: "Category not found",
        });
        return;
      }
      const productsCount = await Product.count({
        where: { cate_id: categoryId },
      });

      if (productsCount > 0) {
        res.status(400).json({
          success: false,
          message: `Cannot delete category with ${productsCount} associated products. Please reassign or delete those products first.`,
        });
        return;
      }

      removeCategoryImageFile(category.cate_image);
      await category.destroy();
      res.status(200).json({
        success: true,
        message: "Category deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to delete category",
        error,
      });
    }
  }

  public async getCategoryStatsOverview(
    req: Request,
    res: Response,
  ): Promise<void> {
    try {
      const categories = await Category.findAll();
      const stats = await Promise.all(
        categories.map(async (category) => {
          const productCount = await Product.count({
            where: { cate_id: category.cate_id },
          });
          return {
            category_id: category.cate_id,
            category_name: category.cate_name,
            cate_image: category.cate_image,
            product_count: productCount,
          };
        }),
      );
      stats.sort((a, b) => b.product_count - a.product_count);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch category stats",
        error,
      });
    }
  }
}

export default new CategoryController();
