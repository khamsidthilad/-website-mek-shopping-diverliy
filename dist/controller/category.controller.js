"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const category_model_1 = __importDefault(require("../models/category.model"));
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
class CategoryController {
    async getAllCategories(req, res) {
        try {
            const categories = await category_model_1.default.findAll();
            res.status(200).json({
                success: true,
                data: categories,
            });
            console.log(categories);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to retrieve categories",
                error,
            });
        }
    }
    async getCategoryById(req, res) {
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
            const category = await category_model_1.default.findByPk(numberId);
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
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to retrieve category",
                error,
            });
        }
    }
    async searchCategories(req, res) {
        try {
            const term = typeof req.query.term === "string" ? req.query.term : req.params.term;
            if (!term) {
                res.status(400).json({
                    success: false,
                    message: "Search term is required",
                });
                return;
            }
            const categories = await category_model_1.default.findAll({
                where: {
                    cate_name: {
                        [sequelize_1.Op.like]: `%${term}%`,
                    },
                },
            });
            res.status(200).json({
                success: true,
                data: categories,
                message: "Categories retrieved successfully",
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to search categories",
                error,
            });
        }
    }
    async getProductsByCategory(req, res) {
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
            const category = await category_model_1.default.findByPk(categoryId);
            if (!category) {
                res.status(404).json({
                    success: false,
                    message: "Category not found",
                });
                return;
            }
            const products = await models_1.Product.findAll({
                where: { cate_id: categoryId },
                order: [["pro_name", "DESC"]],
            });
            res.status(200).json({
                succsess: true,
                data: {
                    category: category,
                    products: products,
                },
                message: "Products retrieved successfully",
            });
        }
        catch (error) {
            res.status(500).json({
                succsess: false,
                message: "Failed to retrieve products for category",
                error,
            });
        }
    }
    async createCategory(req, res) {
        try {
            const { cate_name } = req.body;
            if (!cate_name) {
                res.status(400).json({
                    success: false,
                    message: "Category name is required",
                });
                return;
            }
            const existingCategory = await category_model_1.default.findOne({
                where: { cate_name },
            });
            if (existingCategory) {
                res.status(400).json({
                    success: false,
                    message: "Category with this name already exists",
                });
                return;
            }
            const category = await category_model_1.default.create({
                cate_name,
            });
            res.status(201).json({
                success: true,
                message: "Category created successfully",
                data: category,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to create category",
                error,
            });
        }
    }
    async updatecategory(req, res) {
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
            const category = await category_model_1.default.findByPk(categoryId);
            if (!category) {
                res.status(404).json({
                    success: false,
                    message: "Category not found",
                });
                return;
            }
            if (cate_name && cate_name !== category.cate_name) {
                const existingCategory = await category_model_1.default.findOne({
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
            await category.update({
                cate_name: cate_name || category.cate_name,
            });
            res.status(200).json({
                success: true,
                data: category,
                message: "Category updated successfully",
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to update category",
                error,
            });
        }
    }
    async deleteCategory(req, res) {
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
            const category = await category_model_1.default.findByPk(categoryId);
            if (!category) {
                res.status(404).json({
                    success: false,
                    message: "Category not found",
                });
                return;
            }
            const productsCount = await models_1.Product.count({
                where: { cate_id: categoryId },
            });
            if (productsCount > 0) {
                res.status(400).json({
                    success: false,
                    message: `Cannot delete category with ${productsCount} associated products. Please reassign or delete those products first.`,
                });
                return;
            }
            await category.destroy();
            res.status(200).json({
                success: true,
                message: "Category deleted successfully",
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to delete category",
                error,
            });
        }
    }
    async getCategoryStatsOverview(req, res) {
        try {
            const categories = await category_model_1.default.findAll();
            const stats = await Promise.all(categories.map(async (category) => {
                const productCount = await models_1.Product.count({
                    where: { cate_id: category.cate_id }
                });
                return {
                    category_id: category.cate_id,
                    category_name: category.cate_name,
                    product_count: productCount
                };
            }));
            stats.sort((a, b) => b.product_count - a.product_count);
            res.status(200).json({
                success: true,
                data: stats
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to fetch category stats",
                error,
            });
        }
    }
}
exports.default = new CategoryController();
//# sourceMappingURL=category.controller.js.map