import Auction from "../models/Auction.js";
import AutoBid from "../models/AutoBid.js";
import Bid from "../models/Bids.js";
import User from "../models/User.js";
import { SendOutBidEmail } from "./email.sender.js";
import AuctionLog from "../models/AuctionLog.js";

/**
 * Auto-bid trigger logic:
 * Called every time a new bid is placed manually
 */
export const handleAutoBids = async (auctionId) => {

  const auction = await Auction.findById(auctionId);
  if (!auction || auction.status !== "LIVE") return;

  const currentBid = Math.max(auction.currentBid, auction.startingPrice);
  const minIncrement = auction.minIncrement;

  // Find all active autobidders for this auction
  const autoBidders = await AutoBid.find({ auctionId });

  if (!autoBidders.length) return;

  // Sort bidders by remaining balance (descending) //need modification
  autoBidders.sort((a, b) => {
  if (b.maxLimit === a.maxLimit) {
    return a.createdAt - b.createdAt; // earlier autobid created first
  }
    return b.maxLimit - a.maxLimit;
  });


  let newBidPlaced = false;

  for (const bidder of autoBidders) {

    if (String(bidder.userId) === String(auction.currentWinner)) continue; // skip current winner

    const nextBid = currentBid + minIncrement;

    // Stop if exceeds user's limit
    if (nextBid > bidder.maxLimit) {
      const user = await User.findById(bidder.userId);
      if (user && user.email) {
        await SendOutBidEmail(
          user.email,
          auction.item.name,
          auction.currentBid,
          bidder.maxLimit,
          auctionId,
          auction.title
        );
      } else {
        console.warn(`No email found for user ${bidder.userId}`);
      }
      continue;
    }

    const userId = bidder.userId;

    // Place the bid
    let bid = await Bid.findOne({ auctionId, userId });
    if (!bid) {
      bid = await Bid.create({
        auctionId,
        userId: bidder.userId,
        amount: nextBid,
      });
    }
    else {
      bid.amount = nextBid;
      await bid.save();
    }

    // Update autobid
    const autobid = AutoBid.findOne({ auctionId, userId })
    autobid.lastBidAmount = nextBid;
    autobid.totalAutoBidsPlaced += 1;

    await AuctionLog.create({
        auctionId,
        userId: bidder.userId,
        type: "AUTO_BID_TRIGGERED",
        details: { amount: nextBid },
    });

    // Update auction
    auction.currentBid = nextBid;
    auction.currentWinner = bidder.userId;
    auction.totalBids += 1;
    await auction.save();

    newBidPlaced = true;
    break; // only one auto-bid triggers at a time
  }

  // If a new bid was placed, re-check recursively — maybe other autobidders want to respond
  if (newBidPlaced) {
    await handleAutoBids(auctionId);
  }
};