import express from "express";
import { placeBid } from "../controllers/bidController.js" 
import { setAutoBid, deactivateAutoBid, activateAutoBid, editAutoBid } from "../controllers/autoBidController.js";
import { restrictToLoggedinUserOnly } from "../middleware/authMiddleware.js";
import { validateBid, validateAutoBid } from "../middleware/bidValidMiddleware.js";

const router = express.Router({ mergeParams: true });

//bid
router.post("/place", restrictToLoggedinUserOnly, validateBid, placeBid);

//autobid
router.post("/setauto", restrictToLoggedinUserOnly, validateAutoBid, setAutoBid);

router.post("/editauto/:autobidId", restrictToLoggedinUserOnly, validateAutoBid, editAutoBid);

router.post("/deactivateauto/:autobidId", restrictToLoggedinUserOnly, deactivateAutoBid);

router.post("/activateauto/:autobidId", restrictToLoggedinUserOnly, validateAutoBid, activateAutoBid);

export default router;