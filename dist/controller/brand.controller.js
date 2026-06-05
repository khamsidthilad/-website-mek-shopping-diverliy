"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("../models");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const brand_model_1 = __importDefault(require("../models/brand.model"));
const brandCategory_model_1 = __importDefault(require("../models/brandCategory.model"));
const category_model_1 = __importDefault(require("../models/category.model"));
const product_model_1 = __importDefault(require("../models/product.model"));
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
function brandLogoPath(req) {
    if (!req.file)
        return null;
    return `images/brands/${req.file.filename}`;
}
function removeBrandLogoFile(logoPath) {
    if (!logoPath)
        return;
    const fullPath = path_1.default.join(__dirname, "../../public", logoPath);
    if (fs_1.default.existsSync(fullPath))
        fs_1.default.unlinkSync(fullPath);
}
async function syncBrandCategories(brand, cateIds) {
    if (cateIds.length > 0) {
        const categories = await category_model_1.default.findAll({
            where: { cate_id: cateIds },
        });
        if (categories.length !== cateIds.length) {
            throw new Error("One or more category IDs are invalid");
        }
    }
    await brandCategory_model_1.default.destroy({ where: { brand_id: brand.brand_id } });
    if (cateIds.length > 0) {
        await brandCategory_model_1.default.bulkCreate(cateIds.map((cate_id) => ({ brand_id: brand.brand_id, cate_id })));
    }
}
const brandIncludes = [
    { model: category_model_1.default, as: "categories", through: { attributes: [] } },
    { model: product_model_1.default, as: "products" },
];
class BrandController {
    async getAllBrands(req, res) {
        try {
            const brands = await brand_model_1.default.findAll({
                include: brandIncludes,
                order: [["brand_id", "DESC"]],
            });
            res.status(200).json({ success: true, data: brands });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to fetch brands",
                error: serializeError(error),
            });
        }
    }
    async getBrandById(req, res) {
        try {
            const brandId = parseInt(String(req.params.id), 10);
            if (!Number.isInteger(brandId) || brandId < 1) {
                res.status(400).json({ success: false, message: "Invalid brand ID" });
                return;
            }
            const brand = await brand_model_1.default.findByPk(brandId, { include: brandIncludes });
            if (!brand) {
                res.status(404).json({ success: false, message: "Brand not found" });
                return;
            }
            res.status(200).json({ success: true, data: brand });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to fetch brand",
                error: serializeError(error),
            });
        }
    }
    async createBrand(req, res) {
        try {
            const body = (req.body ?? {});
            const cate_ids = formField(body, "cate_ids", "cateIds");
            const brand = await brand_model_1.default.create({
                name: formString(body, "name", "NAME"),
                tagline: formString(body, "tagline", "TAGLINE"),
                country: formString(body, "country", "COUNTRY"),
                brand_logo: brandLogoPath(req),
            });
            const categoryIds = parseCateIds(cate_ids);
            if (categoryIds !== undefined) {
                await syncBrandCategories(brand, categoryIds);
            }
            const created = await brand_model_1.default.findByPk(brand.brand_id, { include: brandIncludes });
            res.status(201).json({ success: true, data: created });
        }
        catch (error) {
            const message = error instanceof Error && error.message.includes("category")
                ? error.message
                : "Failed to create brand";
            res.status(500).json({
                success: false,
                message,
                error: serializeError(error),
            });
        }
    }
    async updateBrand(req, res) {
        try {
            const brandId = parseInt(String(req.params.id), 10);
            if (!Number.isInteger(brandId) || brandId < 1) {
                res.status(400).json({ success: false, message: "Invalid brand ID" });
                return;
            }
            const brand = await brand_model_1.default.findByPk(brandId);
            if (!brand) {
                res.status(404).json({ success: false, message: "Brand not found" });
                return;
            }
            const body = (req.body ?? {});
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
                tagline: tagline !== undefined ? formString(body, "tagline", "TAGLINE") : brand.tagline,
                country: country !== undefined ? formString(body, "country", "COUNTRY") : brand.country,
                brand_logo: newLogo ?? brand.brand_logo,
            });
            const categoryIds = parseCateIds(cate_ids);
            if (categoryIds !== undefined) {
                await syncBrandCategories(brand, categoryIds);
            }
            const updated = await brand_model_1.default.findByPk(brandId, { include: brandIncludes });
            res.status(200).json({ success: true, data: updated });
        }
        catch (error) {
            const message = error instanceof Error && error.message.includes("category")
                ? error.message
                : "Failed to update brand";
            res.status(500).json({
                success: false,
                message,
                error: serializeError(error),
            });
        }
    }
    async deleteBrand(req, res) {
        try {
            const brandId = parseInt(String(req.params.id), 10);
            if (!Number.isInteger(brandId) || brandId < 1) {
                res.status(400).json({ success: false, message: "Invalid brand ID" });
                return;
            }
            const brand = await brand_model_1.default.findByPk(brandId);
            if (!brand) {
                res.status(404).json({ success: false, message: "Brand not found" });
                return;
            }
            removeBrandLogoFile(brand.brand_logo);
            await brand.destroy();
            res
                .status(200)
                .json({ success: true, message: "Brand deleted successfully" });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to delete brand",
                error: serializeError(error),
            });
        }
    }
}
exports.default = new BrandController();
//# sourceMappingURL=brand.controller.js.map