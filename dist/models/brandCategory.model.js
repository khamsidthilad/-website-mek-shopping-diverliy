"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
/**
 * brand_category — ความสัมพันธ์ many-to-many ระหว่าง brand กับ category
 */
class BrandCategory extends sequelize_1.Model {
}
BrandCategory.init({
    brand_id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        references: { model: "brand", key: "brand_id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    },
    cate_id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        references: { model: "category", key: "cate_id" },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    },
}, {
    sequelize: db_1.sequelize,
    tableName: "brand_category",
    modelName: "BrandCategory",
    timestamps: false,
});
exports.default = BrandCategory;
//# sourceMappingURL=brandCategory.model.js.map