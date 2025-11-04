import mongoose from "mongoose";

const connectDB = async () => {
    try {
      const mongoUri = process.env.MONGO_URI;
      if (!mongoUri) {
        throw new Error("MONGO_URI is not set");
      }
      await mongoose.connect(mongoUri, {
        autoIndex: false,
      });
      
    } catch (error) {
      console.log("config error");
      throw error;
    }
}

export default connectDB;