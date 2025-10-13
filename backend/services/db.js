import mongoose from "mongoose";

const connectDB = async () => {
    try {
      mongoose.connect("mongodb://localhost:27017/BidSphere")
      
    } catch (error) {
      console.log("config error");
    }
}

export default connectDB;