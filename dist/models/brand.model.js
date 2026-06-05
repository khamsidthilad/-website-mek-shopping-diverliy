"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
class Brand extends sequelize_1.Model {
}
Brand.init({
    brand_id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    name: { type: sequelize_1.DataTypes.STRING(150), allowNull: true },
    tagline: { type: sequelize_1.DataTypes.STRING(255), allowNull: true },
    country: { type: sequelize_1.DataTypes.STRING(100), allowNull: true },
    brand_logo: { type: sequelize_1.DataTypes.STRING(500), allowNull: true },
}, {
    sequelize: db_1.sequelize,
    tableName: "brand",
    modelName: "Brand",
    timestamps: true,
});
exports.default = Brand;
//# sourceMappingURL=brand.model.js.map