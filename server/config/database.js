import mongoose from 'mongoose';

export const connectToDatabase = async () => {
  try {
    const dbUri = process.env.MONGODB_URI;
    
    if (!dbUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
      retryWrites: true,
      retryReads: true,
    };

    await mongoose.connect(dbUri, options);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.error('Ensure MONGODB_URI is correct and reachable from this machine.');
    throw error;
  }
};
