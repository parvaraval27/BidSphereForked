import mongoose from "mongoose";

const auctionLogSchema = new mongoose.Schema({
  auctionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "auction",
    required: true,
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    default: null, // null for system events (like auction started)
  },

  type: {
    type: String,
    enum: [
      "BID_PLACED",          // manual user bid
      "AUTO_BID_TRIGGERED",  // autobid placed by system
      "AUTO_BID_SET",        // user enabled autobid
      "AUTO_BID_EDITED",     // user updated autobid limit
      "AUTO_BID_CANCELLED",  // user disabled autobid
      "AUCTION_CREATED",
      "AUCTION_STARTED",
      "AUCTION_ENDED",
      "AUCTION_CANCELLED",
      "AUCTION_UPDATED"
    ],
    required: true,
  },

  amount: {
    type: Number,
    default: null, // only relevant for BID_PLACED or AUTO_BID_TRIGGERED
  },

  details: {
    type: Object, // flexible for storing extra info, e.g. previousBid, incrementStep, etc.
    default: {},
  },

}, { timestamps: true });

auctionLogSchema.index({ auctionId: 1, createdAt: -1 });
auctionLogSchema.index({ userId: 1, auctionId: 1 });

const AuctionLog = mongoose.model("auctionLog", auctionLogSchema);

export default AuctionLog;