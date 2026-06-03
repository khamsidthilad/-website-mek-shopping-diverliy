"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
class BillSellDetail extends sequelize_1.Model {
}
BillSellDetail.init({
    detail_id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    Order_id: { type: sequelize_1.DataTypes.INTEGER.UNSIGNED, allowNull: true },
    Pro_id: { type: sequelize_1.DataTypes.INTEGER.UNSIGNED, allowNull: true },
    qty: { type: sequelize_1.DataTypes.INTEGER.UNSIGNED, allowNull: true },
    Total: { type: sequelize_1.DataTypes.INTEGER, allowNull: true },
    date: { type: sequelize_1.DataTypes.DATEONLY, allowNull: true },
    image: { type: sequelize_1.DataTypes.STRING(500), allowNull: true },
}, {
    sequelize: db_1.sequelize,
    tableName: "bill_sell_detail",
    modelName: "BillSellDetail",
    timestamps: true,
});
exports.default = BillSellDetail;
//# sourceMappingURL=billSellDetail.model.js.map