"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("../models");
const brand_model_1 = __importDefault(require("../models/brand.model"));
const brandCategory_model_1 = __importDefault(require("../models/brandCategory.model"));
const category_model_1 = __importDefault(require("../models/category.model"));
function serializeError(error) {
    if (error instanceof Error)
        return { message: error.message };
    return { message: String(error) };
}
function parsePositiveInt(value) {
    const id = parseInt(String(value), 10);
    return Number.isInteger(id) && id > 0 ? id : null;
}
function parseCateIds(value) {
    if (value === undefined || value === null || value === "")
        return undefined;
    if (typeof value === "string") {
        const trimmed = value.trim();
        if (!trimmed)
            return undefined;
        if (trimmed === "[]")
            return [];
        try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
                return parsed
                    .map((id) => parseInt(String(id), 10))
                    .filter((id) => Number.isInteger(id) && id > 0);
            }
        }
        catch {
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
async function assertBrandExists(brandId) {
    const brand = await brand_model_1.default.findByPk(brandId);
    if (!brand)
        throw new Error("Brand not found");
    return brand;
}
async function assertCategoryExists(cateId) {
    const category = await category_model_1.default.findByPk(cateId);
    if (!category)
        throw new Error("Category not found");
    return category;
}
async function replaceBrandCategories(brandId, cateIds) {
    if (cateIds.length > 0) {
        const categories = await category_model_1.default.findAll({ where: { cate_id: cateIds } });
        if (categories.length !== cateIds.length) {
            throw new Error("One or more category IDs are invalid");
        }
    }
    await brandCategory_model_1.default.destroy({ where: { brand_id: brandId } });
    if (cateIds.length > 0) {
        await brandCategory_model_1.default.bulkCreate(cateIds.map((cate_id) => ({ brand_id: brandId, cate_id })));
    }
}
const linkIncludes = [
    { model: brand_model_1.default, as: "brand" },
    { model: category_model_1.default, as: "category" },
];
class BrandCateController {
    async getAllLinks(req, res) {
        try {
            const links = await brandCategory_model_1.default.findAll({
                include: linkIncludes,
                order: [
                    ["brand_id", "ASC"],
                    ["cate_id", "ASC"],
                ],
            });
            res.status(200).json({ success: true, data: links });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to fetch brand-category links",
                error: serializeError(error),
            });
        }
    }
    async getLinksByBrand(req, res) {
        try {
            const brandId = parsePositiveInt(req.params.brandId);
            if (!brandId) {
                res.status(400).json({ success: false, message: "Invalid brand ID" });
                return;
            }
            await assertBrandExists(brandId);
            const links = await brandCategory_model_1.default.findAll({
                where: { brand_id: brandId },
                include: linkIncludes,
                order: [["cate_id", "ASC"]],
            });
            res.status(200).json({ success: true, data: links });
        }
        catch (error) {
            const status = error instanceof Error && error.message === "Brand not found" ? 404 : 500;
            res.status(status).json({
                success: false,
                message: error instanceof Error ? error.message : "Failed to fetch links by brand",
                error: serializeError(error),
            });
        }
    }
    async getLinksByCategory(req, res) {
        try {
            const cateId = parsePositiveInt(req.params.cateId);
            if (!cateId) {
                res.status(400).json({ success: false, message: "Invalid category ID" });
                return;
            }
            await assertCategoryExists(cateId);
            const links = await brandCategory_model_1.default.findAll({
                where: { cate_id: cateId },
                include: linkIncludes,
                order: [["brand_id", "ASC"]],
            });
            res.status(200).json({ success: true, data: links });
        }
        catch (error) {
            const status = error instanceof Error && error.message === "Category not found"
                ? 404
                : 500;
            res.status(status).json({
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Failed to fetch links by category",
                error: serializeError(error),
            });
        }
    }
    async createLink(req, res) {
        try {
            const body = (req.body ?? {});
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
            const [link, created] = await brandCategory_model_1.default.findOrCreate({
                where: { brand_id: brandId, cate_id: cateId },
                defaults: { brand_id: brandId, cate_id: cateId },
            });
            const data = await brandCategory_model_1.default.findOne({
                where: { brand_id: link.brand_id, cate_id: link.cate_id },
                include: linkIncludes,
            });
            res.status(created ? 201 : 200).json({
                success: true,
                message: created ? "Link created" : "Link already exists",
                data,
            });
        }
        catch (error) {
            const status = error instanceof Error &&
                (error.message === "Brand not found" || error.message === "Category not found")
                ? 404
                : 500;
            res.status(status).json({
                success: false,
                message: error instanceof Error ? error.message : "Failed to create link",
                error: serializeError(error),
            });
        }
    }
    async setBrandCategories(req, res) {
        try {
            const brandId = parsePositiveInt(req.params.brandId);
            if (!brandId) {
                res.status(400).json({ success: false, message: "Invalid brand ID" });
                return;
            }
            await assertBrandExists(brandId);
            const body = (req.body ?? {});
            const cateIds = parseCateIds(body.cate_ids ?? body.cateIds);
            if (cateIds === undefined) {
                res.status(400).json({
                    success: false,
                    message: "cate_ids is required (array, JSON string, or comma-separated)",
                });
                return;
            }
            await replaceBrandCategories(brandId, cateIds);
            const links = await brandCategory_model_1.default.findAll({
                where: { brand_id: brandId },
                include: linkIncludes,
                order: [["cate_id", "ASC"]],
            });
            res.status(200).json({ success: true, data: links });
        }
        catch (error) {
            const status = error instanceof Error &&
                (error.message === "Brand not found" ||
                    error.message.includes("category"))
                ? error.message === "Brand not found"
                    ? 404
                    : 400
                : 500;
            res.status(status).json({
                success: false,
                message: error instanceof Error
                    ? error.message
                    : "Failed to set brand categories",
                error: serializeError(error),
            });
        }
    }
    async deleteLink(req, res) {
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
            const deleted = await brandCategory_model_1.default.destroy({
                where: { brand_id: brandId, cate_id: cateId },
            });
            if (!deleted) {
                res.status(404).json({ success: false, message: "Link not found" });
                return;
            }
            res
                .status(200)
                .json({ success: true, message: "Link removed successfully" });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to delete link",
                error: serializeError(error),
            });
        }
    }
}
exports.default = new BrandCateController();
//# sourceMappingURL=brandCate.controller.js.map