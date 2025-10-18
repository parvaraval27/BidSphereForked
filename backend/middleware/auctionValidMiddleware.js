import { isValidObjectId } from "mongoose";

//middleware to validate title price and both times while creation
function validateCreateAuction(req, res, next) {
  const { title, minimumPrice, startTime, endTime, productCondition } = req.body;

  if(!title || String(title).trim() === "")return res.status(400).json({ message: "Title is required" });

  if(minimumPrice === undefined || minimumPrice === null || isNaN(Number(minimumPrice)))return res.status(400).json({ message: "minimumPrice is required and must be a number" });

  if(!startTime || !endTime)return res.status(400).json({ message: "startTime and endTime are required" });

  const s = new Date(startTime);
  const e = new Date(endTime);
  if(isNaN(s.getTime()) || isNaN(e.getTime()))return res.status(400).json({ message: "Invalid startTime or endTime" });

  if(e <= s)return res.status(400).json({ message: "endTime must be after startTime" });
  
  const allowedConditions = ["used", "new"];
  if (!productCondition || !allowedConditions.includes(productCondition))return res.status(400).json({ message: `productCondition is required and must be one of ${allowedConditions.join(", ")}` });

  next();
}

//middleware to validate allowed fields while updating auction
function validateUpdateAuction(req, res, next) {
  const allowed = [
    "title",
    "description",
    "images",
    "category",
    "minimumPrice",
    "reservePrice",
    "startTime",
    "endTime",
    "productCondition"
  ];
  const updates = Object.keys(req.body);
  const isValidOperation = updates.every((u) => allowed.includes(u));
  if(!isValidOperation)return res.status(400).json({ message: "One or more fields are not allowed to be updated" });

  if(req.body.startTime && req.body.endTime){
    const s = new Date(req.body.startTime);
    const e = new Date(req.body.endTime);
    if(isNaN(s.getTime()) || isNaN(e.getTime()) || e <= s)
      return res.status(400).json({ message: "Invalid startTime or endTime or endTime <= startTime" });
  }
  else if(req.body.startTime || req.body.endTime) {
    const t = req.body.startTime ? new Date(req.body.startTime) : new Date(req.body.endTime);
    if(isNaN(t.getTime()))
      return res.status(400).json({ message: "Invalid date provided" });
  }

  if(req.body.minimumPrice !== undefined && isNaN(Number(req.body.minimumPrice)))
    return res.status(400).json({ message: "minimumPrice must be a number" });

  if(req.body.productCondition) {
    const allowedConditions = ["used", "new"];
    if(!allowedConditions.includes(req.body.productCondition)) {
      return res.status(400).json({ message: `productCondition must be one of ${allowedConditions.join(", ")}` });
    }
  }

  next();
}

//middleware to validate if a param is a valid ObjectId
function validateObjectIdParam(paramName) {
  return function (req, res, next) {
    const id = req.params[paramName];

    if(!isValidObjectId(id))return res.status(400).json({ message: `${paramName} is not a valid id` });

    next();
  };
}

//middleware to ensure auction has not started yet
function ensureBeforeStart(req, res, next) {
  const auction = req.auction;
  if (!auction) return res.status(400).json({ message: "Auction not loaded" });

  const now = new Date();
  const start = new Date(auction.startTime);
  if (now >= start) {
    return res.status(403).json({ message: "Action not allowed: auction already started" });
  }

  next();
}

export { validateCreateAuction, validateUpdateAuction, validateObjectIdParam, ensureBeforeStart };
