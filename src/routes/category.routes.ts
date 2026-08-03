import express from "express";
import CategoryController from "../controller/category.controller";
import { authenticate, isStaff } from "../middleware/auth.";
import { handleUploadError, uploadCategoryImage } from "../middleware/upload";

const router = express.Router();

router.get("/all", CategoryController.getAllCategories);
router.get("/search", CategoryController.searchCategories);
router.get(
  "/stats/overview",
  authenticate,
  isStaff,
  CategoryController.getCategoryStatsOverview,
);
router.get("/:id", CategoryController.getCategoryById);
router.get("/:id/products", CategoryController.getProductsByCategory);
router.post(
  "/create",
  authenticate,
  isStaff,
  uploadCategoryImage,
  handleUploadError,
  CategoryController.createCategory,
);
router.put(
  "/:id",
  authenticate,
  isStaff,
  uploadCategoryImage,
  handleUploadError,
  CategoryController.updatecategory,
);

router.delete("/:id", authenticate, isStaff, CategoryController.deleteCategory);

export default router;
