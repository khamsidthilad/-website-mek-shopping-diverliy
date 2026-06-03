"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import bcrypt from "bcrypt";
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sequelize_1 = require("sequelize");
const customer_model_1 = __importDefault(require("../models/customer.model"));
const db_1 = require("../config/db");
const order_model_1 = __importDefault(require("../models/order.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
// import path from "node:path";
// import fs from "fs";
// import Product from "../models/product.model";
class CustomerController {
    async getAllCustomers(req, res) {
        try {
            const customers = await customer_model_1.default.findAll({
                order: [["cus_name", "ASC"]],
            });
            res.status(200).json({
                success: true,
                data: customers,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to fetch customers",
                error,
            });
        }
    }
    async searchCustomers(req, res) {
        try {
            const term = String(req.query.term || "").trim();
            if (!term) {
                res.status(400).json({
                    success: false,
                    message: "Search term is required",
                });
                return;
            }
            const customers = await customer_model_1.default.findAll({
                where: {
                    [sequelize_1.Op.or]: [
                        {
                            cus_name: {
                                [sequelize_1.Op.like]: `%${term}%`,
                            },
                        },
                        {
                            Tel: {
                                [sequelize_1.Op.like]: `%${term}%`,
                            },
                        },
                        {
                            Email: {
                                [sequelize_1.Op.like]: `%${term}%`,
                            },
                        },
                    ],
                },
                order: [["cus_name", "ASC"]],
            });
            res.status(200).json({
                success: true,
                count: customers.length,
                data: customers,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to search customers",
                error,
            });
        }
    }
    async getCustomerStats(req, res) {
        try {
            const totalCustomers = await customer_model_1.default.count();
            const activeCustomers = await customer_model_1.default.count({
                where: { cus_status: "active" },
            });
            const customersWithOrders = await order_model_1.default.count({
                distinct: true,
                col: "cus_id",
            });
            const topCustomersByOrders = await order_model_1.default.findAll({
                attributes: [
                    "cus_id",
                    [db_1.sequelize.fn("COUNT", db_1.sequelize.col("order_id")), "order_count"],
                ],
                include: [
                    {
                        model: customer_model_1.default,
                        as: "customer",
                        attributes: ["cus_name"],
                    },
                ],
                group: ["cus_id"],
                order: [[db_1.sequelize.literal("order_count"), "DESC"]],
                limit: 5,
            });
            const topCustomersBySpending = await order_model_1.default.findAll({
                attributes: [
                    "cus_id",
                    [db_1.sequelize.fn("SUM", db_1.sequelize.col("price")), "total_spent"],
                ],
                include: [
                    {
                        model: customer_model_1.default,
                        as: "customer",
                        attributes: ["cus_name"],
                    },
                ],
                group: ["cus_id"],
                order: [[db_1.sequelize.literal("total_spent"), "DESC"]],
                limit: 5,
            });
            res.status(200).json({
                success: true,
                data: {
                    total: totalCustomers,
                    active: activeCustomers,
                    withOrders: customersWithOrders,
                    topByOrders: topCustomersByOrders,
                    topBySpending: topCustomersBySpending,
                },
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to fetch customer stats",
                error,
            });
        }
    }
    async createCustomer(req, res) {
        const transaction = await db_1.sequelize.transaction();
        try {
            const { cus_name, tel, address, email, password } = req.body;
            if (!cus_name || !tel || !email || !password) {
                await transaction.rollback();
                res.status(400).json({
                    success: false,
                    message: "Name, telephone, email, and password are required",
                });
                return;
            }
            const existingUser = await user_model_1.default.findOne({
                where: { Email: email },
                transaction,
            });
            if (existingUser) {
                await transaction.rollback();
                res.status(400).json({
                    success: false,
                    message: "User with this email already exists",
                });
                return;
            }
            const customer = await customer_model_1.default.create({
                cus_name,
                Tel: tel,
                address,
                cus_status: "active",
                Email: email,
            }, { transaction });
            const user = await user_model_1.default.create({
                User_id: `CUS${customer.cus_id.toString().padStart(5, "0")}`,
                Full_Name: cus_name,
                Date_of_birth: null,
                Email: email,
                password,
                status: "active",
                tel,
                image: null,
                role: "customer",
            }, { transaction });
            const token = jsonwebtoken_1.default.sign({
                id: user.User_id,
                username: user.Email,
                role: user.role,
                customerId: customer.cus_id,
            }, process.env.JWT_SECRET || "your_jwt_secret", { expiresIn: "1d" });
            await transaction.commit();
            res.status(201).json({
                success: true,
                message: "Customer created successfully",
                data: {
                    customer,
                    user: {
                        id: user.User_id,
                        name: (user.Full_Name || "").split(/\s+/)[0] || "",
                        sname: (user.Full_Name || "").split(/\s+/).slice(1).join(" ") || "",
                        username: user.Email,
                        role: user.role,
                    },
                    token,
                },
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to create customer",
                error,
            });
        }
    }
    async deleteCustomer(req, res) {
        try {
            const { id } = req.params;
            const numericId = Number(id);
            if (isNaN(numericId)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid customer ID",
                });
                return;
            }
            const customer = await customer_model_1.default.findByPk(numericId);
            if (!customer) {
                res.status(404).json({
                    success: false,
                    message: "Customer not found",
                });
                return;
            }
            await customer.destroy();
            res.status(200).json({
                success: true,
                message: "Customer deleted successfully",
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to delete customer",
                error,
            });
        }
    }
    async getCustomerById(req, res) {
        try {
            const { id } = req.params;
            const numericId = Number(id);
            if (isNaN(numericId)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid customer ID",
                });
                return;
            }
            const customer = await customer_model_1.default.findByPk(numericId);
            if (!customer) {
                res.status(404).json({
                    success: false,
                    message: "Customer not found",
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: customer,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to fetch customer",
            });
        }
    }
    async updateCustomer(req, res) {
        const transaction = await db_1.sequelize.transaction();
        try {
            const { id } = req.params;
            const numericId = Number(id);
            if (isNaN(numericId)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid customer ID",
                });
                return;
            }
            const { cus_name, tel, address, cus_status, email } = req.body;
            const customer = await customer_model_1.default.findByPk(numericId, { transaction });
            if (!customer) {
                res.status(404).json({
                    success: false,
                    message: "Customer not found",
                });
                return;
            }
            await customer.update({
                cus_name: cus_name || customer.cus_name,
                Tel: tel || customer.Tel,
                address: address !== undefined ? address : customer.address,
                cus_status: cus_status || customer.cus_status,
                Email: email !== undefined ? email : customer.Email,
            }, { transaction });
            await customer.reload({ transaction });
            const linkedUser = await user_model_1.default.findOne({
                where: {
                    role: "customer",
                    User_id: `CUS${customer.cus_id.toString().padStart(5, "0")}`,
                },
                transaction,
            });
            if (linkedUser) {
                await linkedUser.update({
                    Full_Name: customer.cus_name,
                    tel: customer.Tel,
                    Email: customer.Email,
                    status: customer.cus_status === "active" ? "active" : "inactive",
                }, { transaction });
            }
            await transaction.commit();
            res.status(200).json({
                success: true,
                message: "Customer updated successfully",
                data: customer,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to update customer",
                error,
            });
        }
    }
    async getCustomerOrders(req, res) {
        try {
            const { id } = req.params;
            const numericId = Number(id);
            const customer = await customer_model_1.default.findByPk(numericId);
            if (!customer) {
                res.status(404).json({
                    succsess: false,
                    message: "Customer not found",
                });
            }
            if (isNaN(numericId)) {
                res.status(400).json({
                    success: false,
                    message: "Invalid customer ID",
                });
                return;
            }
            const orders = await order_model_1.default.findAll({
                where: { cus_id: numericId },
                order: [["date", "DESC"]],
            });
            res.status(200).json({
                success: true,
                data: {
                    customer,
                    orders
                },
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to fetch customer orders",
                error,
            });
        }
    }
}
exports.default = new CustomerController();
//# sourceMappingURL=customer.controller.js.map