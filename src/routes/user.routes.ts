import express from "express";
import UserController from "../controller/user.controller";
import { authenticate, isAdmin, isStaff } from "../middleware/auth.";

const router = express.Router();

router.get("/all", authenticate, isStaff, UserController.getAllUsers);
router.get("/me", authenticate, UserController.getCurrentUser);
router.put("/me", authenticate, UserController.updateProfile);
router.get("/:id", authenticate, isStaff, UserController.getUserById);
router.post("/create", authenticate, isStaff, UserController.createUser);
router.put("/:id", authenticate, isStaff, UserController.updateUser);
router.delete("/:id", authenticate, isAdmin, UserController.deleteUser);

export default router;
