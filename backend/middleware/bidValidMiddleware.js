import Auction from "../models/Auction.js";

async function validateBid (req, res, next) {

  const { auctionId } = req.params;
  const { userId, amount } = req.body;
  // const userId = req.user._id;
  const auction = await Auction.findById(auctionId);
  if (!auction) {
    return res.status(404).json({ success: false, message: "Auction not found" });
  }

  // auction id is required and amount must be a number
  if (!auctionId || typeof amount !== "number") {
    return res.status(400).json({ success: false, message: "auctionId and numeric amount are required" });
  }
  
  // amount must be greater then zero and last highest-bid
  if (amount <= 0) {
    return res.status(400).json({ success: false, message: "amount must be greater than zero" });
  }

  if (amount <= auction.currentBid || amount <= auction.startingPrice) {
    return res.status(400).json({ success: false, message: "amount must be greater than Highest-Bid or starting-Price" });
  }
  
  if (amount < auction.currentBid + auction.minIncrement) {
    return res.status(400).json({ 
      success: false, 
      message: `amount must be at least ${auction.minIncrement} higher than the current highest bid` 
    });
  }
  
  // seller can not bid 
  if (auction.createdBy.toString() === userId.toString()) {
    return res.status(400).json({ success: false, message: "You are seller, you can't bid in your auction" });
  }
  
  next();
};

async function validateAutoBid (req, res, next) {

  const { auctionId } = req.params;
  const { maxLimit } = req.body;

  // auction id is required and maxLimit must be a number
  if (typeof maxLimit !== "number") {
    return res.status(400).json({ success: false, message: "Numeric amount are required" });
  }

  // seller can not set auto-bid
  const auction = await Auction.findById(auctionId)
  if (!auction) {
    return res.status(400).json({ success: false, message: "Auction not found" });
  }

  const { userId } = req.body;
  // const userId = req.user._id; 

  if (auction.createdBy.toString() === userId.toString()) {
    return res.status(400).json({
      success: false,
      message: "You are seller, you can't set auto-bid in your auction"
    });
  }

  if (maxLimit < auction.startingPrice) {
    return res.status(400).json({ success: false, message: "Your maxLimit is too low" }); 
  }
  
  next();
}

export{ validateBid, validateAutoBid };