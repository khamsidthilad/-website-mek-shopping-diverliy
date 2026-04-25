import express from "express";
import CategoryController from "../controller/category.controller";
import { authenticate, isStaff } from "../middleware/auth.";
const router = express.Router();

router.get("/all", CategoryController.getAllCategories);
router.get("/search", CategoryController.searchCategories);
router.get("/:id", CategoryController.getCategoryById);
router.get("/:id/products", CategoryController.getProductsByCategory);
router.post(
  "/create",
  authenticate,
  isStaff,
  CategoryController.createCategory,
);
router.put("/:id", authenticate, isStaff, CategoryController.updatecategory);

router.delete("/:id", authenticate, isStaff, CategoryController.deleteCategory);
router.get(
  "/stats/overview",
  authenticate,
  isStaff,
  CategoryController.getCategoryStatsOverview,
);
export default router;
