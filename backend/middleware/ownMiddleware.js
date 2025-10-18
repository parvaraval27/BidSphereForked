import Auction from "../models/Auction.js";

async function validateAuctionOwnership(req, res, next) {
  const { auctionId } = req.params;
  const userId = req.user?._id?.toString();

  if (!auctionId) return res.status(400).json({ message: "auctionId is required" });
  if (!userId) return res.status(401).json({ message: "Not authenticated" });

  try {
    const auction = await Auction.findById(auctionId).lean();
    if (!auction) return res.status(404).json({ message: "Auction not found" });

    if (auction.sellerId?.toString() !== userId)
      return res.status(403).json({ message: "Forbidden: not the owner of this auction" });

    req.auction = auction;
    next();
  } catch (err) {
    console.error("validateAuctionOwnership error:", err);
    return res.status(500).json({ message: "Server error while validating auction ownership" });
  }
}

export { validateAuctionOwnership };