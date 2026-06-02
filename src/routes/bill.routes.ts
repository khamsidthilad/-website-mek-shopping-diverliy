import express from "express";
import BillSellDetailController from "../controller/billsellDetail.controller";
import { authenticate, isStaff } from "../middleware/auth.";
const router = express.Router();

router.get("/all", authenticate, isStaff, BillSellDetailController.getAllBillSellDetails);
router.get("/order/:orderId", authenticate, isStaff, BillSellDetailController.getBillSellDetailsByOrderId);
router.get("/:id", authenticate, isStaff, BillSellDetailController.getBillSellDetailById);
router.post("/create", authenticate, isStaff, BillSellDetailController.createBillSellDetail);
router.put("/:id", authenticate, isStaff, BillSellDetailController.updateBillSellDetail);
router.delete("/:id", authenticate, isStaff, BillSellDetailController.deleteBillSellDetail);


export default router;