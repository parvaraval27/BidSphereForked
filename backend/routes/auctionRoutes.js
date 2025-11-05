import express from "express";
const router = express.Router();
import { createAuction, getMyAuctions, getAuctionById, listAuctions, editAuction, deleteAuction } from "../controllers/auctionController.js";
import { restrictToLoggedinUserOnly as auth } from "../middleware/authMiddleware.js";
import { validateCreateAuction as vCreate, validateUpdateAuction as vUpdate, validateObjectIdParam as vId, ensureBeforeStart} from "../middleware/auctionValidMiddleware.js";
import { validateAuctionOwnership as owner } from "../middleware/ownMiddleware.js";

router.post("/create", auth, vCreate, createAuction);
router.get("/mine", auth, getMyAuctions);
router.get("/", listAuctions);
router.get("/:auctionId", vId("auctionId"), getAuctionById);
router.put("/:auctionId", auth, vId("auctionId"), owner, ensureBeforeStart(2), vUpdate, editAuction);
router.delete("/:auctionId", auth, vId("auctionId"), owner, ensureBeforeStart(2), deleteAuction);

export default router;