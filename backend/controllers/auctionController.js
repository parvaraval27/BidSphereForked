import Auction from "../models/Auction.js";
import Bid from "../models/Bids.js";
import mongoose from "mongoose";

//helper func to determine status i.e. upcoming/live/completed auction
function determineStatus(startTime, endTime) {
  const now=new Date();
  const s=new Date(startTime);
  const e=new Date(endTime);
  if(now < s) return "upcoming";
  if(now >= s && now < e) return "live";
  return "completed";
}

//POST /bidsphere/auctions
async function createAuction(req, res) {
  try {
    const {
      title,
      description="",
      images=[],
      category="",
      minimumPrice,
      reservePrice,
      startTime,
      endTime,
      productCondition,
    }=req.body;

    if(!req.user || !req.user._id)return res.status(401).json({message: "Not authenticated" });

    const start=new Date(startTime);
    const end=new Date(endTime);
    const status=determineStatus(start, end);

    const auctionDoc=new Auction({
      sellerId: req.user._id,
      title: String(title).trim(),
      description: String(description),
      images: Array.isArray(images) ? images : [],
      category: String(category || ""),
      minimumPrice: Number(minimumPrice),
      reservePrice: reservePrice !== undefined ? Number(reservePrice) : undefined,
      currentBid: 0,
      highestBidderId: undefined,
      startTime: start,
      endTime: end,
      status,
      productCondition,
      historyLog: [
        {
          action: "created",
          userId: req.user._id,
          details: {title, minimumPrice, startTime: start.toISOString(), endTime: end.toISOString(), productCondition },
        },
      ]
    });

    const saved=await auctionDoc.save();
    return res.status(201).json({message: "Auction created", auction: saved });
  }
  catch (err) {
    console.error("createAuction error:", err);
    if(err?.name==="ValidationError") {
      const messages=Object.values(err.errors).map((e) => e.message).join("; ");
      return res.status(400).json({message: messages || "Validation error" });
    }
    return res.status(500).json({message: "Server error" });
  }
}

//GET /bidsphere/auctions/mine
async function getMyAuctions(req, res) {
  try {
    if(!req.user || !req.user._id)return res.status(401).json({message: "Not authenticated" });

    const sellerId=req.user._id;
    const {status, page=1, limit=20 }=req.query;

    const filter={sellerId: sellerId };
    if(status) filter.status=status;

    const skip=(Number(page) - 1) * Number(limit);

    const auctions=await Auction.find(filter)
      .sort({createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select("title startTime endTime currentBid status minimumPrice productCondition")
      .lean();

    return res.status(200).json({auctions });
  }
  catch (err) {
    console.error("getMyAuctions error:", err);
    return res.status(500).json({message: "Server error" });
  }
}

//GET /bidsphere/auctions/:auctionId
async function getAuctionById(req, res) {
  try {
    const {auctionId }=req.params;

    if(!mongoose.Types.ObjectId.isValid(auctionId)) {
      return res.status(400).json({message: "Invalid auction id" });
    }

    const auction=await Auction.findById(auctionId).lean();
    if(!auction) return res.status(404).json({message: "Auction not found" });

    const topBids=await Bid.find({auctionId: auction._id })
      .sort({amount: -1 })
      .limit(10)// top 10 bids fetched rn
      .select("bidderId amount timestamp")
      .lean();

    return res.status(200).json({auction, topBids });
  }
  catch (err) {
    console.error("getAuctionById error:", err);
    return res.status(500).json({message: "Server error" });
  }
}

//PUT /bidsphere/auctions/:auctionId
async function updateAuction(req, res) {
  try {
    const {auctionId }=req.params;

    const existing=await Auction.findById(auctionId);
    if(!existing) return res.status(404).json({message: "Auction not found" });

    const bidsCount=await Bid.countDocuments({auctionId: existing._id });
    if(bidsCount > 0 && req.body.minimumPrice !== undefined) {
      return res.status(403).json({message: "Cannot change minimumPrice after bids have been placed" });
    }

    const allowed = [
      "title","description","images","category","minimumPrice","reservePrice","startTime","endTime","productCondition"
    ];

    const updates={};
    const changes={};
    allowed.forEach((field) => {
      if(Object.prototype.hasOwnProperty.call(req.body, field)) {
        const newVal=req.body[field];

        if(field==="startTime" || field==="endTime") updates[field]=new Date(newVal);
        else if(field==="minimumPrice" || field==="reservePrice") updates[field]=newVal !== undefined ? Number(newVal) : newVal;
        else updates[field]=newVal;

        changes[field]={from: existing[field], to: updates[field] };
      }
    });

    if(updates.startTime || updates.endTime) {
      const newStart=updates.startTime || existing.startTime;
      const newEnd=updates.endTime || existing.endTime;
      updates.status=determineStatus(newStart, newEnd);
    }

    updates.updatedAt=new Date();

    const updated=await Auction.findByIdAndUpdate(
      auctionId,
      {
        $set: updates,
        $push: {historyLog: {action: "updated", userId: req.user._id, details: changes } },
      },
      {new: true, runValidators: true }
    );

    return res.status(200).json({message: "Auction updated", auction: updated });
  }
  catch (err) {
    console.error("updateAuction error:", err);
    if(err?.name==="ValidationError") {
      const messages=Object.values(err.errors).map((e) => e.message).join("; ");
      return res.status(400).json({message: messages || "Validation error" });
    }
    return res.status(500).json({message: "Server error" });
  }
}

//DELETE /bidsphere/auctions/:auctionId
async function deleteAuction(req, res) {
  try {
    const { auctionId } = req.params;

    const updated = await Auction.findByIdAndUpdate(
      auctionId,
      { $set: { status: "cancelled" }, $push: { historyLog: { action: "cancelled", userId: req.user._id, details: { reason: req.body?.reason || "cancelled by seller" } } } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Auction not found" });
    return res.status(200).json({ message: "Auction cancelled", auction: updated });
  }
  catch (err) {
    console.error("deleteAuction:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export {createAuction, getMyAuctions, getAuctionById, updateAuction, deleteAuction };