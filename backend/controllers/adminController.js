import Auction from "../models/Auction.js";
import mongoose from "mongoose";

// Helper function to determine status based on time
function determineStatus(startTime, endTime) {
  const now = new Date();
  const s = new Date(startTime);
  const e = new Date(endTime);
  if (now < s) return "UPCOMING";
  if (now >= s && now < e) return "LIVE";
  return "ENDED";
}

async function adminLogin (req, res) {
try{
  const { email, password } = req.body;

  if (req.cookies?.adminToken) {
    return res.status(400).json({ message: "Admin already logged in" });
  }

  if (!email || !password) {
    return res.status(400).json({ message: "Provide email and password" });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (email !== adminEmail) {  
   return res.status(401).json({ message: "Invalid email or password" });
  }


  if (password !== adminPassword) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  let requestIP = req.ip;

  if (requestIP.startsWith("::ffff:")) {
    requestIP = requestIP.split("::ffff:")[1];
  }
  
  res.cookie("adminToken", "admin_logged_in");
  return res.json({ message: "Admin Login successful", admin: { email: adminEmail, adminIP: requestIP } });
}
catch(err){
    console.error("admin login error:", err);
    return res.status(400).json({ success: false, message: err.message });
}
};

async function adminLogout (req, res) {
try{  
  res.clearCookie("adminToken");
  return res.json({ message: "Admin logged out" });
}
catch(err){
    console.error("admin logout error:", err);
    return res.status(400).json({ success: false, message: err.message });
}
};

// GET /bidsphere/admin/auctions - Get all auctions for admin verification
async function getAllAuctions(req, res) {
  try {
    const { status, page = 1, limit = 50, sort = "-createdAt" } = req.query;

    const filter = {};
    if (status) filter.status = status.toUpperCase();

    const skip = (Number(page) - 1) * Number(limit);

    const auctions = await Auction.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate("createdBy", "username email")
      .populate("currentWinner", "username email")
      .lean();

    const total = await Auction.countDocuments(filter);

    return res.status(200).json({
      success: true,
      auctions,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    console.error("getAllAuctions error:", err);
    return res.status(400).json({ success: false, message: err.message });
  }
}

// GET /bidsphere/admin/auctions/:auctionId - Get single auction details for admin
async function getAuctionDetails(req, res) {
  try {
    const { auctionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(auctionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid auction id",
      });
    }

    const auction = await Auction.findById(auctionId)
      .populate("createdBy", "username email")
      .populate("currentWinner", "username email")
      .lean();

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Auction not found",
      });
    }

    return res.status(200).json({
      success: true,
      auction,
    });
  } catch (err) {
    console.error("getAuctionDetails error:", err);
    return res.status(400).json({ success: false, message: err.message });
  }
}

// POST /bidsphere/admin/auctions/:auctionId/verify - Verify an auction
async function verifyAuction(req, res) {
  try {
    const { auctionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(auctionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid auction id",
      });
    }

    const auction = await Auction.findById(auctionId);

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Auction not found",
      });
    }

    if (auction.verified) {
      return res.status(400).json({
        success: false,
        message: "Auction is already verified",
      });
    }

    // Update auction to verified and set status to LIVE
    auction.verified = true;
    auction.status = "LIVE";

    await auction.save();
    await auction.populate("createdBy", "username email");
    await auction.populate("currentWinner", "username email");

    const responseAuction = auction.toObject();

    return res.status(200).json({
      success: true,
      message: "Auction verified successfully",
      auction: responseAuction,
    });
  } catch (err) {
    console.error("verifyAuction error:", err);
    return res.status(400).json({ success: false, message: err.message });
  }
}

// POST /bidsphere/admin/auctions/:auctionId/remove - Remove an auction listing
async function removeAuction(req, res) {
  try {
    const { auctionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(auctionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid auction id",
      });
    }

    const auction = await Auction.findById(auctionId);

    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Auction not found",
      });
    }

    if (auction.status === "REMOVED") {
      return res.status(400).json({
        success: false,
        message: "Auction has already been removed",
      });
    }

    auction.verified = false;
    auction.status = "REMOVED";

    await auction.save();
    await auction.populate("createdBy", "username email");
    await auction.populate("currentWinner", "username email");

    const responseAuction = auction.toObject();

    return res.status(200).json({
      success: true,
      message: "Auction removed successfully",
      auction: responseAuction,
    });
  } catch (err) {
    console.error("removeAuction error:", err);
    return res.status(400).json({ success: false, message: err.message });
  }
}

export { adminLogin, adminLogout, getAllAuctions, getAuctionDetails, verifyAuction, removeAuction };