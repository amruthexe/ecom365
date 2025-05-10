import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectWithRetry(retries: number = 3, delay: number = 2000): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI!, {
      bufferCommands: true,  // Allow buffering commands if MongoDB is not connected
      maxPoolSize: 10,       // Connection pool size, you can increase this based on your traffic
      serverSelectionTimeoutMS: 5000, // Increase timeout to handle slow network
      socketTimeoutMS: 45000, // Timeout for socket operations
    });
    console.log("MongoDB connected");
  } catch (err) {
    if (retries === 0) {
      console.error("MongoDB connection failed after multiple retries:", err);
      throw new Error("Failed to connect to MongoDB");
    } else {
      console.log(`Retrying MongoDB connection, attempts left: ${retries}`);
      await new Promise(resolve => setTimeout(resolve, delay)); // Delay before retrying
      await connectWithRetry(retries - 1, delay); // Retry connection
    }
  }
}

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = connectWithRetry().then(() => mongoose.connection);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
