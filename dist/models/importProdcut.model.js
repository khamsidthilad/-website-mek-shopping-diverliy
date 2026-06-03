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
}, {
    sequelize: db_1.sequelize,
    tableName: "purchase",
    modelName: "Purchase",
    timestamps: true,
});
exports.default = Purchase;
//# sourceMappingURL=importProdcut.model.js.map