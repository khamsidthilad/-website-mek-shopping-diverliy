import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
interface JwtPayload {
  id: string;
  username: string;
  role: string;
  customerId?: number;
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Authentication required. No token provided.",
      });
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your_jwt_secret",
    ) as JwtPayload;

    const user = await User.findByPk(decoded.id);

    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid token. User not found.",
      });
      return;
    }

    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Authentication failed. Invalid token.",
    });
  }
};

export const isAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const user = (req as any).user;

  if (!user || user.role !== "admin") {
    res.status(403).json({
      success: false,
      message: "Access denied. Admin authorization required.",
    });
    return;
  }

  next();
};

export const isStaff = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const user = (req as any).user;

  if (!user || (user.role !== "admin" && user.role !== "staff")) {
    res.status(403).json({
      success: false,
      message: "Access denied. Staff authorization required.",
    });
    return;
  }

  next();
};

export const isCustomer = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const user = (req as any).user;

  if (!user || user.role !== "customer") {
    res.status(403).json({
      success: false,
      message: "Access denied. Customer authorization required.",
    });
    return;
  }

  next();
};

export const isOwnCustomer = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const user = (req as any).user;
  const customerIdParam = (req.params as any).customerId ?? (req.params as any).id;
  const customerIdStr = Array.isArray(customerIdParam)
    ? customerIdParam[0]
    : customerIdParam;

  if (!customerIdStr) {
    res.status(400).json({
      success: false,
      message: "Customer ID parameter is required.",
    });
    return;
  }

  const customerId = parseInt(customerIdStr, 10);
  if (isNaN(customerId)) {
    console.log("customerId is not a valid number:", customerIdStr);
    res.status(400).json({
      success: false,
      message: "Invalid customer ID format.",
    });
    return;
  }
  if (!user) {
    console.log("Authorization failed: No user found");
    res.status(403).json({
      success: false,
      message: "Access denied. User not authenticated.",
    });
    return;
  }

  if (user.role === "customer" && user.customerId !== customerId) {
    res.status(403).json({
      success: false,
      message: "Access denied. You can only access your own data.",
    });
    return;
  }

  next();
};
