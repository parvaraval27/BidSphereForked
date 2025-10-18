import express from "express";
const router = express.Router();
import { createAuction, getMyAuctions, getAuctionById, updateAuction, deleteAuction } from "../controllers/auctionController.js";
import { restrictToLoggedinUserOnly as auth } from "../middleware/authMiddleware.js";
import { validateCreateAuction as vCreate, validateUpdateAuction as vUpdate, validateObjectIdParam as vId, ensureBeforeStart as vTime } from "../middleware/auctionValidMiddleware.js";
import { validateAuctionOwnership as owner } from "../middleware/ownMiddleware.js";

router.post("/", auth, vCreate, createAuction);
router.get("/mine", auth, getMyAuctions);
router.get("/:auctionId", vId("auctionId"), getAuctionById);
router.put("/:auctionId", auth, vId("auctionId"), owner, vTime, vUpdate, updateAuction);
router.delete("/:auctionId", auth, vId("auctionId"), owner, vTime, deleteAuction);

export default router;
