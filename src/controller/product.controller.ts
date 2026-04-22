import { Request, Response } from "express";
import Category from "../models/category.model";
import Product from "../models/product.model";
import { options } from "joi";
import { Op } from "sequelize";

class ProductController {
  public async getAllProducts(req: Request, res: Response): Promise<void> {
    try {
      const products = await Product.findAll({
        include: [{ model: Category, as: "category" }],
      });
      res.status(200).json({
        success: true,
        data: products,
      });
      console.log("Fetched products", { products });
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
        include: [{ model: Category, as: "category" }],
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
        include: [{ model: Category, as: "category" }],
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
      const { pro_name, pro_detail, pro_price, pro_qty, cate_id } = req.body;
      let pro_image = null;
      if (req.file) {
        pro_image = req.file.filename;
      }

      const newProduct = await Product.create({
        pro_name,
        pro_detail,
        pro_price,
        pro_qty,
        pro_image,
        cate_id,
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
      const {id } = req.params;
      const { pro_name, pro_detail, pro_price, pro_qty, cate_id } = req.body;
      let pro_image = null;
      if (req.file) {
        pro_image = req.file.filename;
      }

      const productId = Number(id);

      // Validate that id is a valid number
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

      await product.update({
        pro_name,
        pro_detail,
        pro_price,
        pro_qty,
        pro_image,
        cate_id,
      });

      res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to update product",
        error,
      });
    }
  }
  public async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
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
