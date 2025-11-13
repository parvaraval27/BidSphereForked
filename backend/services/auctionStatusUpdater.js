import cron from "node-cron";
import Auction from "../models/Auction.js";
import { logAuctionEvent } from "./logger.service.js";

let _cronJob = null;
let _isRunning = false;

const BATCH_SIZE = 500;

// batch log events
async function bulkLogAuctionEvents(auctionIds, eventType, details = {}) {
  const logBatchSize = 100;
  for (let i = 0; i < auctionIds.length; i += logBatchSize) {
    const batch = auctionIds.slice(i, i + logBatchSize);
    await Promise.allSettled(
      batch.map((auctionId) => logAuctionEvent({auctionId,userId: null,userName: "SYSTEM",type: eventType,details: { triggeredAt: new Date(), ...details },}))
    );
  }
}

// batch update status
async function processStatusUpdateBatch(query, newStatus, eventType, eventDetails = {}) {
  let allIds = [];
  let skip = 0;
  let totalUpdated = 0;

  while (true) {
    const batch = await Auction.find(query)
      .select("_id")
      .limit(BATCH_SIZE)
      .skip(skip)
      .lean();

    if (batch.length === 0) {break;}

    const batchIds = batch.map((a) => a._id);
    if (batchIds.length > 0) {
      const result = await Auction.updateMany(
        { _id: { $in: batchIds } },
        { $set: { status: newStatus } }
      );
      totalUpdated += result.modifiedCount;
      allIds.push(...batchIds);
    }

    skip += BATCH_SIZE;
    if (batch.length < BATCH_SIZE) {break;}
  }

  if (allIds.length > 0 && totalUpdated > 0) {
    await bulkLogAuctionEvents(allIds, eventType, eventDetails);
  }

  return totalUpdated;
}

// updates in log
async function updateAuctionStatuses() {
  if (_isRunning) {return;}

  _isRunning = true;
  const startTime = Date.now();
  const now = new Date();

  try {
    // upcoming to live
    const toLiveCount = await processStatusUpdateBatch(
      {
        status: "UPCOMING",
        startTime: { $lte: now },
        endTime: { $gt: now },
      },
      "LIVE",
      "AUCTION_STARTED"
    );

    // upcoming to ended
    const upcomingToEndedCount = await processStatusUpdateBatch(
      {
        status: "UPCOMING",
        endTime: { $lte: now },
      },
      "ENDED",
      "AUCTION_ENDED",
      { reason: "endTime passed while UPCOMING" }
    );

    // live to ended
    const toEndedCount = await processStatusUpdateBatch(
      {
        status: "LIVE",
        endTime: { $lte: now },
      },
      "ENDED",
      "AUCTION_ENDED"
    );

    const duration = Date.now() - startTime;
    const totalUpdated = toLiveCount + upcomingToEndedCount + toEndedCount;

    if (totalUpdated > 0) {
      console.log(
        `[AuctionStatusUpdater] Updated ${totalUpdated} auctions (LIVE: ${toLiveCount}, UPCOMING->ENDED: ${upcomingToEndedCount}, LIVE->ENDED: ${toEndedCount}) in ${duration}ms`
      );
    }
  } catch (err) {
    console.error("[AuctionStatusUpdater] Error:", err.message, err.stack);
  } finally {
    _isRunning = false;
  }
}

export function startAuctionStatusUpdater({
  cronPattern = "*/1 * * * *", // every minute set rn
  runOnStart = true,
  } = {}) {
  if (_cronJob) {return;}

  if (!cron.validate(cronPattern)) {throw new Error(`Invalid cron pattern: ${cronPattern}`);}

  if (runOnStart) {
    updateAuctionStatuses().catch((err) =>
      console.error("[AuctionStatusUpdater] Initial run error:", err)
    );
  }

  _cronJob = cron.schedule(cronPattern, () => {
    updateAuctionStatuses().catch((err) =>
      console.error("[AuctionStatusUpdater] Scheduled run error:", err)
    );
  }, {
    scheduled: true,
    timezone: "UTC",
  });

  console.log(
    `[AuctionStatusUpdater] Started with cron pattern: ${cronPattern} (runs every minute)`
  );
}

// stop the updater
export function stopAuctionStatusUpdater() {
  if (_cronJob) {
    _cronJob.stop();
    _cronJob = null;
    console.log("[AuctionStatusUpdater] Stopped");
  }
}

// current status
export function getUpdaterStatus() {
  return { isRunning: Boolean(_cronJob), isProcessing: _isRunning };
}
