import mongoose from "mongoose";

// Note: dns.setServers override removed — it was a local dev workaround that
// overrides system DNS globally. If you have local DNS issues, set the
// MONGODB_URI to use an IP address or configure DNS at the OS level instead.

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

const connectDB = async (retries = MAX_RETRIES) => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4 – avoids IPv6 DNS delays on many networks
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Cleanup legacy index from older schema versions.
    // A stale unique `username` index can cause all registrations to fail with duplicate errors.
    try {
      const usersCollection = mongoose.connection.db.collection("users");
      const indexes = await usersCollection.indexes();
      const hasLegacyUsernameIndex = indexes.some(
        (idx) => idx.name === "username_1",
      );
      if (hasLegacyUsernameIndex) {
        await usersCollection.dropIndex("username_1");
        console.log("Dropped legacy users.username_1 index.");
      }
    } catch (indexError) {
      console.warn("Index cleanup warning:", indexError.message);
    }

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected. Attempting to reconnect...");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("MongoDB reconnected.");
    });
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    if (retries > 0) {
      console.log(
        `Retrying in ${RETRY_DELAY / 1000}s... (${retries} attempts remaining)`,
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return connectDB(retries - 1);
    }
    console.error("Max retries reached. Exiting.");
    process.exit(1);
  }
};

export default connectDB;
