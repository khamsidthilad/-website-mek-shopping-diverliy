"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
class Diverily extends sequelize_1.Model {
}
Diverily.init({
    Deli_id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        comment: "Delivery ID (ລະຫດ ການຈດ ສ່ງົສິນຄາ້)",
    },
    user_id: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: true,
        comment: "User ID (ລະຫດ ຜໃູ້ຊງ້ານ)",
        references: {
            model: "user",
            key: "User_id",
        },
    },
}, {
    sequelize: db_1.sequelize,
    tableName: "delivery",
    timestamps: true,
});
exports.default = Diverily;
//# sourceMappingURL=diverily.model.js.map