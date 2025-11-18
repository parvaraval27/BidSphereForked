import mongoose from "mongoose";

const WatchlistSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    auctionId: { type: mongoose.Schema.Types.ObjectId, ref: "Auction", required: true },
  },
  { timestamps: true }
);

const Watchlist = mongoose.model("Watchlist", WatchlistSchema);

export default Watchlist;