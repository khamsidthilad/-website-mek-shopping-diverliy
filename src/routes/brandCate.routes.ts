import express from "express";
import BrandCateController from "../controller/brandCate.controller";
import { authenticate, isStaff } from "../middleware/auth.";

const router = express.Router();

router.get("/all", authenticate, isStaff, BrandCateController.getAllLinks);
router.get(
  "/brand/:brandId",
  authenticate,
  isStaff,
  BrandCateController.getLinksByBrand,
);
router.get(
  "/category/:cateId",
  authenticate,
  isStaff,
  BrandCateController.getLinksByCategory,
);
router.post("/create", authenticate, isStaff, BrandCateController.createLink);
router.put(
  "/brand/:brandId",
  authenticate,
  isStaff,
  BrandCateController.setBrandCategories,
);
router.delete(
  "/:brandId/:cateId",
  authenticate,
  isStaff,
  BrandCateController.deleteLink,
);

export default router;
