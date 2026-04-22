
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Customer, User } from "../models";
import bcrypt from "bcrypt";

function splitFullName(fullName: string | null): { name: string; sname: string } {
  const parts = (fullName ?? "").trim().split(/\s+/).filter(Boolean);
  const name = parts[0] ?? "";
  const sname = parts.slice(1).join(" ");
  return { name, sname };
}
class AuthController {
    public async register(req: Request, res: Response) {
        try {
            const {
                name,
                sname,
                dateOfBirth,
                username,
                password,
                tel,
                address
            } = req.body;

            const existingUser = await User.findOne({ where: { Email: username } });
            if (existingUser) {
                res.status(400).json({
                    success: false,
                    message: 'Username already exists'
                });
                return;
            }
            const customer = await Customer.create({
                cus_name: `${name} ${sname}`,
                Tel: tel,
                address,
                cus_status: 'active',
                Email: username,
            });

            const user = await User.create({
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
            const token = jwt.sign(
                {
                    id: user.User_id,
                    username: user.Email,
                    role: user.role,
                    customerId: customer.cus_id
                },
                process.env.JWT_SECRET || 'your_jwt_secret',
                { expiresIn: '1d' }
            );
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
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to register user',
                error
            });
        }
    }

    public async login(req: Request, res: Response) {
        try {
            const { username, password } = req.body;

            const user = await User.findOne({ where: { Email: username } });
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid username or password'
                });
                return;
            }

            const isPasswordValid = await bcrypt.compare(password, user.password || '');
            if (!isPasswordValid) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid username or password'
                });
                return;
            }

            let customerId = null;
            if (user.role === 'customer') {
                const customer = await Customer.findOne({
                    where: { cus_name: user.Full_Name }
                });
                if (customer) customerId = customer.cus_id;
            }

            const token = jwt.sign(
                {
                    id: user.User_id,
                    username: user.Email,
                    role: user.role,
                    customerId
                },
                process.env.JWT_SECRET || 'your_jwt_secret',
                { expiresIn: '1d' }
            );
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
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to login',
                error
            });
        }
    }

    public async getCurrentUser(req: Request, res: Response) {
        try {
            
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to get current user',
                error
            });
        }
    }
}
export default new AuthController();

