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
function serializeError(error) {
    if (error instanceof Error)
        return { message: error.message };
    return { message: String(error) };
}
function formField(body, ...keys) {
    for (const key of keys) {
        const value = body[key];
        if (value !== undefined && value !== null && value !== "")
            return value;
    }
    return undefined;
}
function formString(body, ...keys) {
    const value = formField(body, ...keys);
    if (value === undefined)
        return null;
    return String(value);
}
function parseOptionalInt(value) {
    if (value === undefined)
        return undefined;
    if (value === null || value === "")
        return null;
    const parsed = parseInt(String(value), 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}
function parseOptionalDecimal(value) {
    if (value === undefined)
        return undefined;
    if (value === null || value === "")
        return null;
    const parsed = Number(String(value));
    return Number.isFinite(parsed) ? parsed : null;
}
function productImagePath(req) {
    if (!req.file)
        return null;
    return `images/products/${req.file.filename}`;
}
function removeProductImageFile(imagePath) {
    if (!imagePath)
        return;
    const fullPath = path_1.default.join(__dirname, "../../public", imagePath);
    if (fs_1.default.existsSync(fullPath))
        fs_1.default.unlinkSync(fullPath);
}
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
            const body = (req.body ?? {});
            const newProduct = await product_model_1.default.create({
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
            const productId = parseInt(String(req.params.id), 10);
            if (!Number.isInteger(productId) || productId < 1) {
                res.status(400).json({
                    success: false,
                    message: "Invalid product ID",
                });
                return;
            }
            const product = await product_model_1.default.findByPk(productId, {
                include: [
                    { model: category_model_1.default, as: "category" },
                    { model: brand_model_1.default, as: "brand" },
                ],
            });
            if (!product) {
                res.status(404).json({
                    success: false,
                    message: "Product not found",
                });
                return;
            }
            const body = (req.body ?? {});
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
                pro_name: pro_name !== undefined
                    ? formString(body, "pro_name", "proName", "PRO_NAME")
                    : product.pro_name,
                pro_detail: pro_detail !== undefined
                    ? formString(body, "pro_detail", "proDetail", "PRO_DETAIL")
                    : product.pro_detail,
                pro_price: pro_price !== undefined
                    ? parseOptionalDecimal(pro_price) ?? product.pro_price
                    : product.pro_price,
                pro_qty: pro_qty !== undefined
                    ? parseOptionalInt(pro_qty) ?? product.pro_qty
                    : product.pro_qty,
                pro_image: newImage ?? product.pro_image,
                cate_id: cate_id !== undefined
                    ? parseOptionalInt(cate_id) ?? product.cate_id
                    : product.cate_id,
                brand_id: brand_id !== undefined
                    ? parseOptionalInt(brand_id) ?? product.brand_id
                    : product.brand_id,
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
                error: serializeError(error),
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