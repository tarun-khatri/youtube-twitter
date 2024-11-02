import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js'; // Import DB_NAME from constants

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URL; // Use MONGO_URL from .env
    console.log(`Connecting to MongoDB at: ${uri}`);

    const connectionInstance = await mongoose.connect(uri, {
      dbName: DB_NAME, // Use DB_NAME directly from constants
    });

    console.log(`MongoDB connected. Host: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
