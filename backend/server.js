import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import path from "path";

// express app
const app = express();
app.set("trust proxy", true);

//connect to db
import connectDB from "./services/db.js";
import { startAuctionStatusUpdater } from "./services/auctionStatusUpdater.js";

const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    const cronPattern = process.env.AUCTION_STATUS_UPDATER_CRON || "*/1 * * * *";
    startAuctionStatusUpdater({ 
      cronPattern,
      runOnStart: true 
    });
  })
  .catch((err) => {
    console.error("Database connection failed");
  });

//middlewares
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.json({ limit: "10mb" }));      
app.use(cookieParser());      
// serve uploaded files from /uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
import { restrictToLoggedinUserOnly, checkAuth } from "./middleware/authMiddleware.js"; 
import { restrictAdminIP } from "./middleware/adminMiddleware.js";

// home page
app.get ("/", restrictToLoggedinUserOnly, (req, res) => res.send("BidSphere Online Auction System") );

// User Route
import authRoutes from "./routes/authRoutes.js";
app.use("/bidsphere/user", authRoutes);

// Admin Route
import adminRoutes from "./routes/adminRoutes.js";
app.use("/bidsphere/admin", (req, res, next) => {
  if (!process.env.ADMIN_IP) return next();
  return restrictAdminIP(req, res, next);
}, adminRoutes)

// Auction Route
import auctionRoutes from "./routes/auctionRoutes.js";
app.use("/bidsphere/auctions", auctionRoutes);

// Bid Route
import bidRoutes from "./routes/bidRoutes.js";
app.use("/BidSphere/:auctionId/bid", bidRoutes);

// Payment Routes
import paymentRoutes from "./routes/paymentRoutes.js";
app.use("/bidsphere/admin/payments", restrictAdminIP, paymentRoutes);

// UPI Payment Routes (public)
import upiRoutes from "./routes/upiRoutes.js";
app.use("/bidsphere/upi", upiRoutes);

export default app;