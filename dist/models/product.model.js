"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
class Product extends sequelize_1.Model {
}
Product.init({
    pro_id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    pro_name: { type: sequelize_1.DataTypes.STRING(255), allowNull: true },
    pro_detail: { type: sequelize_1.DataTypes.STRING(500), allowNull: true },
    pro_price: { type: sequelize_1.DataTypes.DECIMAL(12, 2), allowNull: true },
    pro_image: { type: sequelize_1.DataTypes.STRING(500), allowNull: true },
    pro_qty: { type: sequelize_1.DataTypes.INTEGER.UNSIGNED, allowNull: true, defaultValue: 0 },
    cate_id: { type: sequelize_1.DataTypes.INTEGER.UNSIGNED, allowNull: true },
    brand_id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: { model: "brand", key: "brand_id" },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
    },
}, {
    sequelize: db_1.sequelize,
    tableName: "product",
    modelName: "Product",
    timestamps: true,
});
exports.default = Product;
//# sourceMappingURL=product.model.js.map