/**
 * Database Connection Configuration
 * 
 * This file sets up the connection to the MongoDB database using Mongoose.
 * It initializes the connection and provides the MongoDB client for database operations.
 */
import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';

// MongoDB connection URI - use the default MongoDB URI or fallback to local development URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow';

// Database connection state
let cachedClient: MongoClient | null = null;
let cachedDb: mongoose.Connection | null = null;

/**
 * Connect to MongoDB using Mongoose
 * 
 * @returns The Mongoose connection object
 */
export async function connectToDatabase() {
  // If we have a cached connection, return it
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // Configure Mongoose to use the MongoDB driver's Promise implementation
  mongoose.Promise = global.Promise;

  // Connect to MongoDB using Mongoose
  try {
    // Set strictQuery to prepare for Mongoose 7 
    mongoose.set('strictQuery', false);
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    
    console.log('Connected to MongoDB successfully');
    
    cachedClient = new MongoClient(MONGODB_URI);
    cachedDb = mongoose.connection;
    
    return { client: cachedClient, db: cachedDb };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Initialize connection on server startup
connectToDatabase().catch(console.error);

// Export the mongoose instance for model definitions
export { mongoose };
