"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const category_model_1 = __importDefault(require("../models/category.model"));
const brand_model_1 = __importDefault(require("../models/brand.model"));
const product_model_1 = __importDefault(require("../models/product.model"));
const sequelize_1 = require("sequelize");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class ProductController {
    async getAllProducts(req, res) {
        try {
            const products = await product_model_1.default.findAll({
                include: [
                    { model: category_model_1.default, as: "category" },
                    { model: brand_model_1.default, as: "brand" },
                ],
            });
            res.status(200).json({
                success: true,
                data: products,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to fetch products",
                error,
            });
        }
    }
    async getProductById(req, res) {
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
            const products = await product_model_1.default.findByPk(productId, {
                include: [
                    { model: category_model_1.default, as: "category" },
                    { model: brand_model_1.default, as: "brand" },
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
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to fetch product",
                error,
            });
        }
    }
    async searchProducts(req, res) {
        try {
            const { term } = req.query;
            const products = await product_model_1.default.findAll({
                where: {
                    pro_name: {
                        [sequelize_1.Op.like]: `%${term}%`,
                    },
                },
                include: [
                    { model: category_model_1.default, as: "category" },
                    { model: brand_model_1.default, as: "brand" },
                ],
            });
            res.status(200).json({
                success: true,
                data: products,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to search products",
                error,
            });
        }
    }
    async createProduct(req, res) {
        try {
            const { pro_name, pro_detail, pro_price, pro_qty, cate_id, brand_id } = req.body;
            let pro_image = null;
            if (req.file) {
                pro_image = req.file.filename;
            }
            const newProduct = await product_model_1.default.create({
                pro_name,
                pro_detail,
                pro_price,
                pro_qty,
                pro_image,
                cate_id,
                brand_id: brand_id ?? null,
            });
            res.status(201).json({
                success: true,
                data: newProduct,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to fetch product",
                error,
            });
        }
    }
    async updateProduct(req, res) {
        try {
            const { id } = req.params;
            const { pro_name, pro_detail, pro_price, pro_qty, cate_id, brand_id } = req.body;
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
            const product = await product_model_1.default.findByPk(productId);
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
                brand_id: brand_id !== undefined ? brand_id : product.brand_id,
            });
            res.status(200).json({
                success: true,
                data: product,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to update product",
                error,
            });
        }
    }
    async deleteProduct(req, res) {
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
            const product = await product_model_1.default.findByPk(productId);
            if (!product) {
                res.status(404).json({
                    success: false,
                    message: "Product not found",
                });
                return;
            }
            if (product.pro_image) {
                const imagePath = path_1.default.join(__dirname, "../../public", product.pro_image);
                if (fs_1.default.existsSync(imagePath)) {
                    fs_1.default.unlinkSync(imagePath);
                }
            }
            await product.destroy();
            res.status(200).json({
                success: true,
                message: "Product deleted successfully",
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to delete product",
                error,
            });
        }
    }
}
exports.default = new ProductController();
//# sourceMappingURL=product.controller.js.map