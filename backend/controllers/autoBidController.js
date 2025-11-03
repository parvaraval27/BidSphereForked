import AutoBid from "../models/AutoBid.js"
import Bid from "../models/Bids.js";
import Auction from "../models/Auction.js";
import AuctionLog from "../models/AuctionLog.js";
import { handleAutoBids } from "../services/autoBid.service.js";

export const setAutoBid = async (req, res) => {
  
  const { auctionId } = req.params;
  const { userId, maxLimit } = req.body;

  const auction = await Auction.findById(auctionId);
  if (!auction) {
    return res.status(404).json({ success: false, message: "Auction not found" });
  }
    
  //Check if user already has an autobid for this auction
  const existingAutoBid = await AutoBid.findOne({ auctionId, userId });
  if (existingAutoBid) {
    return res.status(400).json({
    success: false,
    message: "Auto-bid already set for this auction" });
  }

  const autobid = await AutoBid.create({
    auctionId: auctionId,
    userId: userId,
    maxLimit: maxLimit,
  });

  await AuctionLog.create({
      auctionId,
      userId,
      type: "AUTO_BID_SET",
      details: { maxLimit, setAt: new Date() },
    });

  // push autobidder
  if (!auction.autoBidders.some(id => String(id) === String(userId))) {
    auction.autoBidders.push(userId);
    await auction.save();
  }
  
  handleAutoBids(auctionId);

  return res.status(200).json(autobid);
};

export const editAutoBid = async (req, res) => {
  try {
    const { newMaxLimit, userId } = req.body;
    const { autobidId } = req.params;
    // const userId = req.user._id;

    if (!autobidId) {
      return res.status(400).json({
        success: false,
        message: "This Autobid is not in DB",
      });
    }

    const autobid = await AutoBid.findById(autobidId);
    if (!autobid) {
      return res.status(404).json({
        success: false,
        message: "Auto-bid not found for this user and auction",
      });
    }

    const { auctionId } = req.params;
    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({
        success: false,
        message: "Auction not found",
      });
    }

    if (auction.status === "ENDED" || auction.status === "CANCELLED") {
      return res.status(404).json({
        success: false,
        message: "No updatation allowed for Autobid in this Auction",
      });
    }

    autobid.maxLimit = newMaxLimit;
    await autobid.save();

    await AuctionLog.create({
      auctionId,
      userId,
      type: "AUTO_BID_UPDATED",
      details: { oldLimit, newLimit: newMaxLimit },
    });

    handleAutoBids(auctionId);

    return res.status(200).json({
      success: true,
      message: "Auto-bid max limit updated successfully",
      data: autobid,
    });
  } 
  catch (err) {
    console.error("Error editing auto-bid:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

export const activateAutoBid = async (req, res) => {
  
  try {
    const { auctionId, autobidId } = req.params;
    const { userId } = req.body;
    // const userId = req.user._id;

    const autobid = await AutoBid.findById(autobidId);
    if (!autobid) {
      return res.status(404).json({
        success: false,
        message: "Auto-bid record not found for this user and auction",
      });
    }
 
    if (autobid.isActive) {
      return res.status(200).json({
        success: true,
        message: "Auto-bid is already active",
      });
    }

    autobid.isActive = true;
    await autobid.save();

    await AuctionLog.create({
      auctionId,
      userId,
      type: "AUTO_BID_ACTIVATED",
      details: { activatedAt: new Date(), maxLimit: autobid.maxLimit },
    });


    handleAutoBids(auctionId);
    
    return res.status(200).json({
      success: true,
      message: "Auto-bid activated successfully",
    });
  } 
  catch (err) {
    console.error("Error activating auto-bid:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

export const deactivateAutoBid = async (req, res) => {
  try {
    const { auctionId, autobidId } = req.params;
    const { userId } = req.body;
    // const userId = req.user._id; 

    const existingAutoBid = await AutoBid.findById(autobidId);
    if (!existingAutoBid) {
      return res.status(404).json({
        success: false,
        message: "Auto-bid not found for this user and auction",
      });
    }

    existingAutoBid.isActive = false;
    await existingAutoBid.save();

    await Auction.findByIdAndUpdate(auctionId, {
      $pull: { autoBidders: userId },
    });

    await AuctionLog.create({
      auctionId,
      userId,
      type: "AUTO_BID_DEACTIVATED",
      details: { deactivatedAt: new Date() },
    });

    return res.status(200).json({
      success: true,
      message: "Auto-bid cancelled successfully",
    });
  } 
  catch (err) {
    console.error("Error cancelling auto-bid:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};