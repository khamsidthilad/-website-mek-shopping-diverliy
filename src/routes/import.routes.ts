import express from "express";
import ImportController from "../controller/import_controller";
import { authenticate, isStaff } from "../middleware/auth.";

const router = express.Router();

router.get("/all", authenticate, isStaff, ImportController.getAllImports);
router.get("/:id", authenticate, isStaff, ImportController.getImportById);
router.post("/create", authenticate, isStaff, ImportController.createImport);
router.put("/:id", authenticate, isStaff, ImportController.updateImport);
router.delete("/:id", authenticate, isStaff, ImportController.deleteImport);

export default router;
