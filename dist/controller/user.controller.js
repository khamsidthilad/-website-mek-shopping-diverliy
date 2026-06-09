"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const user_model_1 = __importDefault(require("../models/user.model"));
const PUBLIC_USER_ATTRIBUTES = [
    "User_id",
    "Full_Name",
    "Date_of_birth",
    "Email",
    "status",
    "tel",
    "image",
    "role",
    "createdAt",
    "updatedAt",
];
function serializeError(error) {
    if (error instanceof Error)
        return { message: error.message };
    return { message: String(error) };
}
function getAuthUser(req) {
    return req.user;
}
async function generateUserId(role) {
    const prefix = role === "admin" ? "ADMIN" : "STAFF";
    const users = await user_model_1.default.findAll({
        where: { User_id: { [sequelize_1.Op.like]: `${prefix}%` } },
        attributes: ["User_id"],
    });
    let maxNum = 0;
    for (const user of users) {
        const num = parseInt(user.User_id.replace(prefix, ""), 10);
        if (Number.isInteger(num) && num > maxNum)
            maxNum = num;
    }
    return `${prefix}${String(maxNum + 1).padStart(5, "0")}`;
}
class UserController {
    async getAllUsers(_req, res) {
        try {
            const users = await user_model_1.default.findAll({
                attributes: [...PUBLIC_USER_ATTRIBUTES],
                order: [["createdAt", "DESC"]],
            });
            res.status(200).json({ success: true, data: users });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to fetch users",
                error: serializeError(error),
            });
        }
    }
    async getCurrentUser(req, res) {
        try {
            const authUser = getAuthUser(req);
            if (!authUser) {
                res.status(401).json({ success: false, message: "Authentication required" });
                return;
            }
            const user = await user_model_1.default.findByPk(authUser.id, {
                attributes: [...PUBLIC_USER_ATTRIBUTES],
            });
            if (!user) {
                res.status(404).json({ success: false, message: "User not found" });
                return;
            }
            res.status(200).json({
                success: true,
                data: {
                    ...user.toJSON(),
                    customerId: authUser.customerId ?? null,
                },
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to fetch current user",
                error: serializeError(error),
            });
        }
    }
    async getUserById(req, res) {
        try {
            const userId = String(req.params.id ?? "").trim();
            if (!userId) {
                res.status(400).json({ success: false, message: "User ID is required" });
                return;
            }
            const user = await user_model_1.default.findByPk(userId, {
                attributes: [...PUBLIC_USER_ATTRIBUTES],
            });
            if (!user) {
                res.status(404).json({ success: false, message: "User not found" });
                return;
            }
            res.status(200).json({ success: true, data: user });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to fetch user",
                error: serializeError(error),
            });
        }
    }
    async createUser(req, res) {
        try {
            const body = (req.body ?? {});
            const Full_Name = body.Full_Name ?? body.fullName ?? body.full_name;
            const Email = body.Email ?? body.email ?? body.username;
            const password = body.password;
            const role = String(body.role ?? "staff").toLowerCase();
            const status = body.status ?? "active";
            const tel = body.tel ?? body.Tel ?? null;
            const Date_of_birth = body.Date_of_birth ?? body.dateOfBirth ?? null;
            const image = body.image ?? null;
            if (!Full_Name || !Email || !password) {
                res.status(400).json({
                    success: false,
                    message: "Full_Name, Email, and password are required",
                });
                return;
            }
            if (role !== "admin" && role !== "staff") {
                res.status(400).json({
                    success: false,
                    message: "Only admin or staff users can be created here. Use /auth/register for customers.",
                });
                return;
            }
            const authUser = getAuthUser(req);
            if (role === "admin" && authUser?.role !== "admin") {
                res.status(403).json({
                    success: false,
                    message: "Only admins can create admin users",
                });
                return;
            }
            const existingUser = await user_model_1.default.findOne({ where: { Email: String(Email) } });
            if (existingUser) {
                res.status(400).json({
                    success: false,
                    message: "A user with this email already exists",
                });
                return;
            }
            const user = await user_model_1.default.create({
                User_id: await generateUserId(role),
                Full_Name: String(Full_Name),
                Email: String(Email),
                password: String(password),
                role,
                status: status ? String(status) : "active",
                tel: tel ? String(tel) : null,
                Date_of_birth: Date_of_birth ? Date_of_birth : null,
                image: image ? String(image) : null,
            });
            const created = await user_model_1.default.findByPk(user.User_id, {
                attributes: [...PUBLIC_USER_ATTRIBUTES],
            });
            res.status(201).json({ success: true, data: created });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to create user",
                error: serializeError(error),
            });
        }
    }
    async updateProfile(req, res) {
        try {
            const authUser = getAuthUser(req);
            if (!authUser) {
                res.status(401).json({ success: false, message: "Authentication required" });
                return;
            }
            const user = await user_model_1.default.findByPk(authUser.id);
            if (!user) {
                res.status(404).json({ success: false, message: "User not found" });
                return;
            }
            const body = (req.body ?? {});
            const password = body.password;
            await user.update({
                Full_Name: body.Full_Name !== undefined
                    ? String(body.Full_Name)
                    : body.fullName !== undefined
                        ? String(body.fullName)
                        : user.Full_Name,
                Date_of_birth: body.Date_of_birth !== undefined
                    ? body.Date_of_birth
                    : body.dateOfBirth !== undefined
                        ? body.dateOfBirth
                        : user.Date_of_birth,
                tel: body.tel !== undefined
                    ? body.tel
                        ? String(body.tel)
                        : null
                    : body.Tel !== undefined
                        ? body.Tel
                            ? String(body.Tel)
                            : null
                        : user.tel,
                image: body.image !== undefined ? (body.image ? String(body.image) : null) : user.image,
                ...(password ? { password: String(password) } : {}),
            });
            const updated = await user_model_1.default.findByPk(user.User_id, {
                attributes: [...PUBLIC_USER_ATTRIBUTES],
            });
            res.status(200).json({
                success: true,
                data: {
                    ...updated?.toJSON(),
                    customerId: authUser.customerId ?? null,
                },
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to update profile",
                error: serializeError(error),
            });
        }
    }
    async updateUser(req, res) {
        try {
            const userId = String(req.params.id ?? "").trim();
            if (!userId) {
                res.status(400).json({ success: false, message: "User ID is required" });
                return;
            }
            const user = await user_model_1.default.findByPk(userId);
            if (!user) {
                res.status(404).json({ success: false, message: "User not found" });
                return;
            }
            const body = (req.body ?? {});
            const authUser = getAuthUser(req);
            const nextRole = body.role !== undefined ? String(body.role).toLowerCase() : user.role;
            if (nextRole === "admin" && authUser?.role !== "admin") {
                res.status(403).json({
                    success: false,
                    message: "Only admins can assign the admin role",
                });
                return;
            }
            if (body.Email !== undefined || body.email !== undefined) {
                const nextEmail = String(body.Email ?? body.email);
                const duplicate = await user_model_1.default.findOne({
                    where: { Email: nextEmail, User_id: { [sequelize_1.Op.ne]: userId } },
                });
                if (duplicate) {
                    res.status(400).json({
                        success: false,
                        message: "A user with this email already exists",
                    });
                    return;
                }
            }
            await user.update({
                Full_Name: body.Full_Name !== undefined
                    ? String(body.Full_Name)
                    : body.fullName !== undefined
                        ? String(body.fullName)
                        : user.Full_Name,
                Email: body.Email !== undefined
                    ? String(body.Email)
                    : body.email !== undefined
                        ? String(body.email)
                        : user.Email,
                Date_of_birth: body.Date_of_birth !== undefined
                    ? body.Date_of_birth
                    : body.dateOfBirth !== undefined
                        ? body.dateOfBirth
                        : user.Date_of_birth,
                status: body.status !== undefined ? String(body.status) : user.status,
                tel: body.tel !== undefined
                    ? body.tel
                        ? String(body.tel)
                        : null
                    : body.Tel !== undefined
                        ? body.Tel
                            ? String(body.Tel)
                            : null
                        : user.tel,
                image: body.image !== undefined ? (body.image ? String(body.image) : null) : user.image,
                role: nextRole,
                ...(body.password ? { password: String(body.password) } : {}),
            });
            const updated = await user_model_1.default.findByPk(userId, {
                attributes: [...PUBLIC_USER_ATTRIBUTES],
            });
            res.status(200).json({ success: true, data: updated });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to update user",
                error: serializeError(error),
            });
        }
    }
    async deleteUser(req, res) {
        try {
            const userId = String(req.params.id ?? "").trim();
            if (!userId) {
                res.status(400).json({ success: false, message: "User ID is required" });
                return;
            }
            const authUser = getAuthUser(req);
            if (authUser?.id === userId) {
                res.status(400).json({
                    success: false,
                    message: "You cannot delete your own account",
                });
                return;
            }
            const user = await user_model_1.default.findByPk(userId);
            if (!user) {
                res.status(404).json({ success: false, message: "User not found" });
                return;
            }
            if (user.role === "admin") {
                const adminCount = await user_model_1.default.count({ where: { role: "admin" } });
                if (adminCount <= 1) {
                    res.status(400).json({
                        success: false,
                        message: "Cannot delete the last admin user",
                    });
                    return;
                }
            }
            await user.destroy();
            res.status(200).json({ success: true, message: "User deleted successfully" });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to delete user",
                error: serializeError(error),
            });
        }
    }
}
exports.default = new UserController();
//# sourceMappingURL=user.controller.js.map