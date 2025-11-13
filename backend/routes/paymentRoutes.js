import express from "express";

const router = express.Router();
import * as paymentController from "../controllers/paymentController.js";

router.post("/verify-payment", paymentController.verifyPayment);

router.post("/capture-payment", paymentController.capturePayment);

router.post("/void-payment", paymentController.voidPayment);

router.get("/payments", paymentController.listPayments);

router.get("/payment/:paymentId", paymentController.getPaymentDetails);
export default router;

