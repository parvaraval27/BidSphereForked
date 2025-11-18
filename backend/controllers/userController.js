import Watchlist from "../models/Watchlist.js";
import Auction from "../models/Auction.js";
import Bid from "../models/Bids.js";

export async function getWatchlist(req, res) {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(200).json({ watchlist: [] });

    const items = await Watchlist.find({ userId }).populate({
      path: "auctionId",
      select: "title item images startTime endTime currentBid status startingPrice totalBids",
    }).lean();

    const auctions = items.map(i => i.auctionId).filter(Boolean);
    return res.status(200).json({ watchlist: auctions });
  } catch (err) {
    console.error("getWatchlist error:", err);
    return res.status(500).json({ watchlist: [] });
  }
}

export async function addToWatchlist(req, res) {
  try {
    const userId = req.user?._id;
    const { auctionId } = req.body;
    if (!userId || !auctionId) return res.status(400).json({ message: "Missing params" });

    const existing = await Watchlist.findOne({ userId, auctionId });
    if (existing) return res.status(200).json({ message: "Already in watchlist" });

    const created = await Watchlist.create({ userId, auctionId });
    return res.status(201).json({ success: true, item: created });
  } catch (err) {
    console.error("addToWatchlist error:", err);
    return res.status(500).json({ message: err.message || "Add failed" });
  }
}

export async function removeFromWatchlist(req, res) {
  try {
    const userId = req.user?._id;
    const { auctionId } = req.params;
    if (!userId || !auctionId) return res.status(400).json({ message: "Missing params" });

    await Watchlist.deleteOne({ userId, auctionId });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("removeFromWatchlist error:", err);
    return res.status(500).json({ message: err.message || "Remove failed" });
  }
}

export async function getBiddingHistory(req, res) {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(200).json({ history: [] });

    const bids = await Bid.find({ bidderId: userId })
      .sort({ createdAt: -1 })
      .populate({ path: "auctionId", select: "title item" })
      .lean();

    return res.status(200).json({ history: bids });
  } catch (err) {
    console.error("getBiddingHistory error:", err);
    return res.status(500).json({ history: [] });
  }
}