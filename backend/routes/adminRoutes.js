import express from "express";
const router = express.Router();
import { adminLogin, adminLogout, getAllAuctions, getAuctionDetails, verifyAuction, removeAuction } from "../controllers/adminController.js";
import { requireAdminAuth } from "../middleware/adminMiddleware.js";

router.post("/login", adminLogin);
router.post("/logout", adminLogout);

router.get("/auctions", requireAdminAuth, getAllAuctions);
router.get("/auctions/:auctionId", requireAdminAuth, getAuctionDetails);
router.post("/auctions/:auctionId/verify", requireAdminAuth, verifyAuction);
router.post("/auctions/:auctionId/remove", requireAdminAuth, removeAuction);


export default router;