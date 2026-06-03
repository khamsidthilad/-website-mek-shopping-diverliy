"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
class Category extends sequelize_1.Model {
}
Category.init({
    cate_id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    cate_name: { type: sequelize_1.DataTypes.STRING(150), allowNull: true },
}, {
    sequelize: db_1.sequelize,
    tableName: "category",
    modelName: "Category",
    timestamps: true,
});
exports.default = Category;
//# sourceMappingURL=category.model.js.map