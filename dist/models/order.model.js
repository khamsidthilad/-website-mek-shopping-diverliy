"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
class Order extends sequelize_1.Model {
}
const int10Pk = {
    type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
    comment: "ລະຫັດການສັ່ງຊື້",
};
const int10Fk = {
    type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
};
Order.init({
    order_id: int10Pk,
    pro_id: {
        ...int10Fk,
        references: { model: "product", key: "pro_id" },
        comment: "ລະຫັດສິນຄ້າ (FK → product)",
    },
    date: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: true,
        comment: "ວັນທີ່",
    },
    price: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        comment: "ລາຄາ",
    },
    cus_id: {
        ...int10Fk,
        references: { model: "customer", key: "cus_id" },
        comment: "ລະຫັດລູກຄ້າ (FK → customer)",
    },
    payment_status: { type: sequelize_1.DataTypes.STRING(50), allowNull: true },
    shipping_status: { type: sequelize_1.DataTypes.STRING(50), allowNull: true },
    payment_image: { type: sequelize_1.DataTypes.STRING(500), allowNull: true },
    tracking_number: { type: sequelize_1.DataTypes.STRING(100), allowNull: true },
}, {
    sequelize: db_1.sequelize,
    tableName: "orders",
    modelName: "Order",
    timestamps: true,
});
exports.default = Order;
//# sourceMappingURL=order.model.js.map