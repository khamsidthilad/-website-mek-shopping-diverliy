"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
const bcrypt_1 = __importDefault(require("bcrypt"));
class User extends sequelize_1.Model {
}
User.init({
    User_id: {
        type: sequelize_1.DataTypes.STRING(50),
        primaryKey: true,
    },
    Full_Name: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
    },
    Date_of_birth: {
        type: sequelize_1.DataTypes.DATEONLY,
        allowNull: true,
    },
    Email: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
        unique: true,
    },
    password: {
        type: sequelize_1.DataTypes.STRING(100),
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: true,
    },
    tel: {
        type: sequelize_1.DataTypes.STRING(20),
        allowNull: true,
    },
    image: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
    },
    role: {
        type: sequelize_1.DataTypes.STRING(50),
        allowNull: true,
        defaultValue: 'customer',
    },
}, {
    sequelize: db_1.sequelize,
    tableName: 'user',
    modelName: 'User',
    hooks: {
        beforeCreate: async (user) => {
            if (user.password) {
                user.password = await bcrypt_1.default.hash(user.password, 10);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password') && user.password) {
                user.password = await bcrypt_1.default.hash(user.password, 10);
            }
        },
    },
});
exports.default = User;
//# sourceMappingURL=user.model.js.map