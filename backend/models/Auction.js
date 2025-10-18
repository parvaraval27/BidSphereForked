import mongoose from "mongoose";

const historyLogSchema = new mongoose.Schema({
    action: { 
        type: String, 
        required: true        // "created", "updated", "cancelled"
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'user', 
        required: true 
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    },
    details: { 
        type: mongoose.Schema.Types.Mixed 
    }
}, { _id: false });

const auctionSchema = new mongoose.Schema({
    sellerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'user', 
        required: true 
    },
    title: { 
        type: String, 
        required: true, 
        trim: true 
    },
    description: { 
        type: String, 
        required: true
    },
    images: {
        type: [String],
        required: true,
        validate: {
            validator: (arr) => arr.length > 0,
            message: 'At least one image is required'
        }
    },
    category: { 
        type: String, 
        default: '' 
    },
    minimumPrice: { 
        type: Number, 
        required: true, 
        min: 0 
    },
    reservePrice: { 
        type: Number 
    },
    currentBid: { 
        type: Number, 
        default: 0 
    },
    highestBidderId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'user' 
    },
    startTime: { 
        type: Date, 
        required: true 
    },
    endTime: { 
        type: Date, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['upcoming', 'live', 'completed', 'cancelled'], 
        default: 'upcoming' 
    },
    historyLog: { 
        type: [historyLogSchema], 
        default: [] 
    },
    productCondition: { 
        type: String, 
        enum: ['used', 'new'], 
        required: true 
    }
}, { timestamps: true });

auctionSchema.index({ sellerId: 1 });
auctionSchema.index({ status: 1 });
auctionSchema.index({ startTime: 1 });
auctionSchema.index({ endTime: 1 });
auctionSchema.index({ currentBid: -1 });

const Auction = mongoose.model("auction", auctionSchema);

export default Auction;