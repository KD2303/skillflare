import mongoose from 'mongoose';

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

const connectDB = async (retries = MAX_RETRIES) => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4,            // Force IPv4 – avoids IPv6 DNS delays on many networks
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected.');
    });
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    if (retries > 0) {
      console.log(`Retrying in ${RETRY_DELAY / 1000}s... (${retries} attempts remaining)`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return connectDB(retries - 1);
    }
    console.error('Max retries reached. Exiting.');
    process.exit(1);
  }
};

export default connectDB;
