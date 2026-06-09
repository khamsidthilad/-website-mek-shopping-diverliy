"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
class Purchase extends sequelize_1.Model {
}
Purchase.init({
    Purchase_id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: true,
        references: { model: "user", key: "User_id" },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
    },
    pro_id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: { model: "product", key: "pro_id" },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
    },
    sup_id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: { model: "supplier", key: "sup_id" },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
    },
    quantity: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        defaultValue: 0,
    },
    price: {
        type: sequelize_1.DataTypes.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: 0,
    },
}, {
    sequelize: db_1.sequelize,
    tableName: "purchase",
    modelName: "Purchase",
    timestamps: true,
});
exports.default = Purchase;
//# sourceMappingURL=importProdcut.model.js.map