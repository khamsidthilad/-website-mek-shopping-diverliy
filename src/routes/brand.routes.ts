import express from "express";
import BrandController from "../controller/brand.controller";
import { authenticate, isStaff } from "../middleware/auth.";
import { handleUploadError, uploadBrandLogo } from "../middleware/upload";

const router = express.Router();

router.get("/all", authenticate, isStaff, BrandController.getAllBrands);
router.get("/:id", authenticate, isStaff, BrandController.getBrandById);
router.post(
  "/create",
  authenticate,
  isStaff,
  uploadBrandLogo,
  handleUploadError,
  BrandController.createBrand,
);
router.put(
  "/:id",
  authenticate,
  isStaff,
  uploadBrandLogo,
  handleUploadError,
  BrandController.updateBrand,
);
router.delete("/:id", authenticate, isStaff, BrandController.deleteBrand);

export default router;
