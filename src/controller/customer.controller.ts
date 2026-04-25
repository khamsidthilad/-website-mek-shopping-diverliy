import { Request, Response } from "express";

// import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import Customer from "../models/customer.model";
import { sequelize } from "../config/db";
import Order from "../models/order.model";
import User from "../models/user.model";
// import path from "node:path";
// import fs from "fs";
// import Product from "../models/product.model";

class CustomerController {
  public async getAllCustomers(req: Request, res: Response): Promise<void> {
    try {
      const customers = await Customer.findAll({
        order: [["cus_name", "ASC"]],
      });

      res.status(200).json({
        success: true,
        data: customers,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch customers",
        error,
      });
    }
  }
  public async searchCustomers(req: Request, res: Response): Promise<void> {
    try {
      const term = String(req.query.term || "").trim();

      if (!term) {
        res.status(400).json({
          success: false,
          message: "Search term is required",
        });
        return;
      }
      const customers = await Customer.findAll({
        where: {
          [Op.or]: [
            {
              cus_name: {
                [Op.like]: `%${term}%`,
              },
            },
            {
              Tel: {
                [Op.like]: `%${term}%`,
              },
            },
            {
              Email: {
                [Op.like]: `%${term}%`,
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
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to search customers",
        error,
      });
    }
  }
  public async getCustomerStats(req: Request, res: Response): Promise<void> {
    try {
      const totalCustomers = await Customer.count();

      const activeCustomers = await Customer.count({
        where: { cus_status: "active" },
      });

      const customersWithOrders = await Order.count({
        distinct: true,
        col: "cus_id",
      });

      const topCustomersByOrders = await Order.findAll({
        attributes: [
          "cus_id",
          [sequelize.fn("COUNT", sequelize.col("order_id")), "order_count"],
        ],
        include: [
          {
            model: Customer,
            as: "customer",
            attributes: ["cus_name"],
          },
        ],
        group: ["cus_id"],
        order: [[sequelize.literal("order_count"), "DESC"]],
        limit: 5,
      });

      const topCustomersBySpending = await Order.findAll({
        attributes: [
          "cus_id",
          [sequelize.fn("SUM", sequelize.col("price")), "total_spent"],
        ],
        include: [
          {
            model: Customer,
            as: "customer",
            attributes: ["cus_name"],
          },
        ],
        group: ["cus_id"],
        order: [[sequelize.literal("total_spent"), "DESC"]],
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
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch customer stats",
        error,
      });
    }
  }

  public async createCustomer(req: Request, res: Response): Promise<void> {
    const transaction = await sequelize.transaction();

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

      const existingUser = await User.findOne({
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

      const customer = await Customer.create(
        {
          cus_name,
          Tel: tel,
          address,
          cus_status: "active",
          Email: email,
        },
        { transaction },
      );

      const user = await User.create(
        {
          User_id: `CUS${customer.cus_id.toString().padStart(5, "0")}`,
          Full_Name: cus_name,
          Date_of_birth: null,
          Email: email,
          password,
          status: "active",
          tel,
          image: null,
          role: "customer",
        },
        { transaction },
      );

      const token = jwt.sign(
        {
          id: user.User_id,
          username: user.Email,
          role: user.role,
          customerId: customer.cus_id,
        },
        process.env.JWT_SECRET || "your_jwt_secret",
        { expiresIn: "1d" },
      );

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
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to create customer",
        error,
      });
    }
  }

  public async deleteCustomer(req: Request, res: Response): Promise<void> {
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
      const customer = await Customer.findByPk(numericId);

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
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to delete customer",
        error,
      });
    }
  }

  public async getCustomerById(req: Request, res: Response): Promise<void> {
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

      const customer = await Customer.findByPk(numericId);

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
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch customer",
      });
    }
  }

  public async updateCustomer(req: Request, res: Response): Promise<void> {
    const transaction = await sequelize.transaction();
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
      const customer = await Customer.findByPk(numericId, { transaction });

      if (!customer) {
        res.status(404).json({
          success: false,
          message: "Customer not found",
        });
        return;  
      }

      await customer.update(
        {
          cus_name: cus_name || customer.cus_name,
          Tel: tel || customer.Tel,
          address: address !== undefined ? address : customer.address,
          cus_status: cus_status || customer.cus_status,
          Email: email !== undefined ? email : customer.Email,
        },
        { transaction },
      );
      await customer.reload({ transaction });

      const linkedUser = await User.findOne({
        where: {
          role: "customer",
          User_id: `CUS${customer.cus_id.toString().padStart(5, "0")}`,
        },
        transaction,
      });

      if (linkedUser) {
        await linkedUser.update(
          {
            Full_Name: customer.cus_name,
            tel: customer.Tel,
            Email: customer.Email,
            status: customer.cus_status === "active" ? "active" : "inactive",
          },
          { transaction },
        );
      }

      await transaction.commit();

      res.status(200).json({
        success: true,
        message: "Customer updated successfully",
        data: customer,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to update customer",
        error,
      });
    }
  }

  public async getCustomerOrders(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const numericId = Number(id);
      const customer = await Customer.findByPk(numericId);
      if(!customer){
        res.status(404).json({
          succsess: false,
          message: "Customer not found",
        })
      }
      if (isNaN(numericId)) {
        res.status(400).json({
          success: false,
          message: "Invalid customer ID",
        });
        return;
      }

      const orders = await Order.findAll({
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

    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch customer orders",
        error,
      });
    }
  }

  
}
export default new CustomerController();
