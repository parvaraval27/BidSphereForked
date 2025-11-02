import Auction from "../models/Auction.js";
import AutoBid from "../models/AutoBid.js";
import Bid from "../models/Bids.js"
import { handleAutoBids } from "../services/autoBid.service.js";
import AuctionLog from "../models/AuctionLog.js";

export const placeBid = async (req, res) => {

  const { auctionId } = req.params;
  const { amount, userId } = req.body;
  // const userId = req.user._id;

  const auction = await Auction.findById(auctionId);
  if (!auction) {
    return res.status(404).json({ success: false, message: "Auction not found" });
  }
  // check if user have activated autobid
  const autobid = await AutoBid.findOne({ auctionId, userId });
  if (autobid && autobid.isActive) {
    return res.status(400).json({
      success: false,
      message: "You have already activated auto-bid for this auction"
    });
  }

  let bid = await Bid.findOne({ auctionId, userId });
  if (!bid) {
    bid = await Bid.create({
      auctionId: auctionId,
      userId: userId,
      amount: amount
    });
  }
  else {
    bid.amount = amount;
    await bid.save();
  }
  
  //update auction
  auction.currentBid = amount;
  auction.currentWinner = userId;
  auction.totalBids += 1;
  await auction.save();

  await AuctionLog.create({
    auctionId,
    userId,
    type: "BID_PLACED",
    amount,
    details: { method: "manual" }
  });

  handleAutoBids(auctionId);

  return res.status(200).json("Bid placed successfully");
};