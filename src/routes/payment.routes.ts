import express from "express";
import PaymentController from "../controller/payment.controller";

const router = express.Router();

/**
 * Public webhook — register in PhaJay portal:
 * Settings → Webhook → https://YOUR_DOMAIN/api/payments/phajay/webhook
 */
router.post("/phajay/webhook", PaymentController.phajayWebhook);

export default router;
