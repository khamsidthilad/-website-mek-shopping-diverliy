"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
class Customer extends sequelize_1.Model {
}
Customer.init({
    cus_id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    cus_name: { type: sequelize_1.DataTypes.STRING(150), allowNull: true },
    Tel: { type: sequelize_1.DataTypes.STRING(20), allowNull: true },
    address: { type: sequelize_1.DataTypes.STRING(255), allowNull: true },
    cus_status: { type: sequelize_1.DataTypes.STRING(50), allowNull: true },
    Email: { type: sequelize_1.DataTypes.STRING(100), allowNull: true },
}, {
    sequelize: db_1.sequelize,
    tableName: "customer",
    modelName: "Customer",
    timestamps: true,
});
exports.default = Customer;
//# sourceMappingURL=customer.model.js.map