import express from "express";
const router = express.Router();
import { createAuction, getMyAuctions, getAuctionById, listAuctions, editAuction, deleteAuction, uploadBase64Images } from "../controllers/auctionController.js";
import multer from "multer";
// fs/path used previously to ensure upload dir; removed in revert

// multer setup - store files in uploads/ with original name (sanitized)
const storage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, "uploads/"),
	filename: (req, file, cb) => {
		const safe = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
		const fname = `${Date.now()}_${Math.random().toString(36).slice(2,8)}_${safe}`;
		cb(null, fname);
	},
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB per file
// (reverted) previously ensured uploads directory here; no-op on revert
import { restrictToLoggedinUserOnly as auth } from "../middleware/authMiddleware.js";
import { validateCreateAuction as vCreate, validateUpdateAuction as vUpdate, validateObjectIdParam as vId, ensureBeforeStart} from "../middleware/auctionValidMiddleware.js";
import { validateAuctionOwnership as owner } from "../middleware/ownMiddleware.js";

router.post("/create", auth, vCreate, createAuction);
router.post("/upload-base64", auth, uploadBase64Images);
// multipart upload (FormData) -> returns { success: true, files: [<absoluteUrls>] }
router.post("/upload", auth, upload.array("images", 5), (req, res) => {
	try {
		const files = req.files || [];
		const host = req.get("host");
		const proto = req.protocol || "http";
		const urls = files.map((f) => `${proto}://${host}/uploads/${f.filename}`);
		return res.status(201).json({ success: true, files: urls });
	} catch (err) {
		console.error("multipart upload error:", err);
		return res.status(500).json({ success: false, message: err.message });
	}
});
router.get("/mine", auth, getMyAuctions);
router.get("/", listAuctions);
router.get("/:auctionId", vId("auctionId"), getAuctionById);
router.put("/:auctionId", auth, vId("auctionId"), owner, ensureBeforeStart(2), vUpdate, editAuction);
router.delete("/:auctionId", auth, vId("auctionId"), owner, ensureBeforeStart(2), deleteAuction);

export default router;