"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
class ContactMessage extends sequelize_1.Model {
}
ContactMessage.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    name: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: false,
    },
    email: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
    },
    message: {
        type: sequelize_1.DataTypes.STRING(1000),
        allowNull: false,
    },
}, {
    sequelize: db_1.sequelize,
    tableName: 'contact_messages',
    timestamps: true,
});
exports.default = ContactMessage;
//# sourceMappingURL=contactMessage.model.js.map