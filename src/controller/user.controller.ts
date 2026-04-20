import { Request, Response } from "express";
import User from "../model/user.model";

export const createUser = async (req: Request, res: Response) => {
  try {
    const user = await User.create(req.body);
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getUsers = async (_req: Request, res: Response) => {
  const users = await User.findAll();
  res.json(users);
};