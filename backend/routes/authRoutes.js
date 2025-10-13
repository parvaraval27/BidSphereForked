import express from "express";
const router = express.Router();
import { handleRegister , handleLogin, handleLogout, verifyEmail} from "../controllers/authController.js";



router.post("/register", handleRegister);

router.post("/verifyemail", verifyEmail);

router.post("/login", handleLogin);

router.post("/logout", handleLogout);

// router.get("/me", protect, getMe);

export default router;