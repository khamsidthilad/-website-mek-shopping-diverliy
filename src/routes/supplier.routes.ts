import express from "express";
import SupplierController from "../controller/supplier.controller";
import { authenticate, isStaff } from "../middleware/auth.";

const router = express.Router();

router.get("/all", authenticate, isStaff, SupplierController.getAllSuppliers);
router.get("/:id", authenticate, isStaff, SupplierController.getSupplierById);
router.post("/create", authenticate, isStaff, SupplierController.createSupplier);
router.put("/:id", authenticate, isStaff, SupplierController.updateSupplier);
router.delete("/:id", authenticate, isStaff, SupplierController.deleteSupplier);

export default router;
