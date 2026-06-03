"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
class Supplier extends sequelize_1.Model {
}
Supplier.init({
    sup_id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        comment: "ລະຫັດຜູ້ຂາຍ",
    },
    name: { type: sequelize_1.DataTypes.STRING(50), allowNull: true },
    Tel: { type: sequelize_1.DataTypes.STRING(15), allowNull: true },
    address: { type: sequelize_1.DataTypes.STRING(100), allowNull: true },
    pro_id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: { model: "product", key: "pro_id" },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
    },
}, {
    sequelize: db_1.sequelize,
    tableName: "supplier",
    modelName: "Supplier",
    timestamps: true,
});
exports.default = Supplier;
//# sourceMappingURL=supplier.model.js.map