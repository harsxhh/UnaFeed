import mongoose from 'mongoose';

export const connectToDatabase = async () => {
  try {
    const dbUri = process.env.MONGODB_URI
    await mongoose.connect(dbUri);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};
