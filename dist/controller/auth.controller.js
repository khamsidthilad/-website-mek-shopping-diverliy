"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const models_1 = require("../models");
const bcrypt_1 = __importDefault(require("bcrypt"));
function splitFullName(fullName) {
    const parts = (fullName ?? "").trim().split(/\s+/).filter(Boolean);
    const name = parts[0] ?? "";
    const sname = parts.slice(1).join(" ");
    return { name, sname };
}
class AuthController {
    async register(req, res) {
        try {
            const { name, sname, dateOfBirth, username, password, tel, address } = req.body;
            const existingUser = await models_1.User.findOne({ where: { Email: username } });
            if (existingUser) {
                res.status(400).json({
                    success: false,
                    message: 'Username already exists'
                });
                return;
            }
            const customer = await models_1.Customer.create({
                cus_name: `${name} ${sname}`,
                Tel: tel,
                address,
                cus_status: 'active',
                Email: username,
            });
            const user = await models_1.User.create({
                User_id: `CUS${customer.cus_id.toString().padStart(5, '0')}`,
                Full_Name: `${name} ${sname}`.trim(),
                Date_of_birth: dateOfBirth,
                Email: username,
                password,
                status: 'active',
                tel,
                image: null,
                role: 'customer',
            });
            const token = jsonwebtoken_1.default.sign({
                id: user.User_id,
                username: user.Email,
                role: user.role,
                customerId: customer.cus_id
            }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1d' });
            const { name: n, sname: sn } = splitFullName(user.Full_Name);
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                token,
                user: {
                    id: user.User_id,
                    name: n,
                    sname: sn,
                    username: user.Email,
                    role: user.role,
                    customerId: customer.cus_id
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to register user',
                error
            });
        }
    }
    async login(req, res) {
        try {
            const { username, password } = req.body;
            const user = await models_1.User.findOne({ where: { Email: username } });
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid username or password'
                });
                return;
            }
            const isPasswordValid = await bcrypt_1.default.compare(password, user.password || '');
            if (!isPasswordValid) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid username or password'
                });
                return;
            }
            let customerId = null;
            if (user.role === 'customer') {
                const customer = await models_1.Customer.findOne({
                    where: { cus_name: user.Full_Name }
                });
                if (customer)
                    customerId = customer.cus_id;
            }
            const token = jsonwebtoken_1.default.sign({
                id: user.User_id,
                username: user.Email,
                role: user.role,
                customerId
            }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1d' });
            const { name, sname } = splitFullName(user.Full_Name);
            res.status(200).json({
                success: true,
                token,
                user: {
                    id: user.User_id,
                    name,
                    sname,
                    username: user.Email,
                    role: user.role,
                    customerId
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to login',
                error
            });
        }
    }
    async getCurrentUser(req, res) {
        try {
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to get current user',
                error
            });
        }
    }
}
exports.default = new AuthController();
//# sourceMappingURL=auth.controller.js.map