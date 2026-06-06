import express from "express";
import ProductController from "../controller/product.controller";
import { authenticate, isStaff } from "../middleware/auth.";
import { handleUploadError, uploadProductImage } from "../middleware/upload";
const router = express.Router();

router.get("/all", ProductController.getAllProducts);
router.get("/search/:term", ProductController.searchProducts);
router.get("/:id", ProductController.getProductById);
router.post(
  "/create",
  authenticate,
  isStaff,
  uploadProductImage,
  handleUploadError,
  ProductController.createProduct,
);
router.put(
  "/update/:id",
  uploadProductImage,
  handleUploadError,
  ProductController.updateProduct,
);
router.delete("/delete/:id", ProductController.deleteProduct);

export default router;
