import mongoose from "mongoose";
import logger from "./logger.js";

// Connection pool configuration for better resource management
const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds
const CONNECTION_POOL_SIZE = 10; // Max connections in pool
const CONNECTION_TIMEOUT = 30000; // 30 seconds to establish connection

const connectDB = async (retries = MAX_RETRIES) => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Connection pool settings
      maxPoolSize: CONNECTION_POOL_SIZE,
      minPoolSize: 5,
      maxIdleTimeMS: 45000,

      // Timeout and retry settings
      serverSelectionTimeoutMS: CONNECTION_TIMEOUT,
      socketTimeoutMS: 45000,
      connectTimeoutMS: CONNECTION_TIMEOUT,
      retryWrites: true,
      retryReads: true,

      // Network optimization
      family: 4, // Force IPv4 – avoids IPv6 DNS delays on many networks

      // Connection string defaults
      authSource: "admin",
    });

    logger.info("MongoDB Connected successfully", {
      host: conn.connection.host,
      dbName: conn.connection.db?.databaseName,
    });

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      logger.error("MongoDB connection error", err);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected. Attempting to reconnect...");
    });

    mongoose.connection.on("reconnected", () => {
      logger.info("MongoDB reconnected successfully");
    });

    // Cleanup legacy index from older schema versions
    try {
      const usersCollection = mongoose.connection.db.collection("users");
      const indexes = await usersCollection.indexes();
      const hasLegacyUsernameIndex = indexes.some(
        (idx) => idx.name === "username_1",
      );
      if (hasLegacyUsernameIndex) {
        await usersCollection.dropIndex("username_1");
        logger.info("Dropped legacy users.username_1 index");
      }
    } catch (indexError) {
      // Ignore "ns does not exist" errors - collection is new/doesn't exist yet
      if (!indexError.message.includes("ns does not exist")) {
        logger.warn("Index cleanup warning", { error: indexError.message });
      }
    }
  } catch (error) {
    logger.error(
      `MongoDB connection failed (attempt ${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`,
      error,
    );

    if (retries > 0) {
      logger.info(`Retrying in ${RETRY_DELAY / 1000}s...`, {
        retriesRemaining: retries,
      });
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return connectDB(retries - 1);
    }

    logger.critical("Max retries reached. Unable to connect to MongoDB");
    process.exit(1);
  }
};

export default connectDB;
