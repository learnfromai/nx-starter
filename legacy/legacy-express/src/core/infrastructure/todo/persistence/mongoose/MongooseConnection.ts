import mongoose from 'mongoose';
import { config } from '@/config/config';

/**
 * Mongoose connection management
 * For MongoDB connections
 */
export const connectMongoDB = async (): Promise<void> => {
  try {
    const mongoUrl =
      config.database.url ||
      `mongodb://${config.database.host || 'localhost'}:${config.database.port || 27017}/${config.database.database || 'task_app'}`;

    await mongoose.connect(mongoUrl, {
      // Modern Mongoose doesn't need these options anymore
      // but keeping them for compatibility if using older versions
    });

    console.log('📦 MongoDB connected successfully');

    // Handle connection events
    mongoose.connection.on('error', error => {
      console.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('📦 MongoDB disconnected');
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
};

export const disconnectMongoDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('📦 MongoDB connection closed');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    throw error;
  }
};

// Graceful shutdown handler
process.on('SIGINT', async () => {
  await disconnectMongoDB();
  process.exit(0);
});
