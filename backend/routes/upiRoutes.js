import express from "express";

const router = express.Router();
import * as paymentController from "../controllers/paymentController.js";

router.post("/create-order", paymentController.createOrder);

router.post("/create-cod", paymentController.createCodOrder);

router.get("/status/:paymentId", paymentController.getPaymentStatus);
export default router;

