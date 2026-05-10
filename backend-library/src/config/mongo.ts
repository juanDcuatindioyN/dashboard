import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined. Check your .env file.');
}

export const connectMongo = async (): Promise<void> => {
  await mongoose.connect(process.env.MONGODB_URI as string, {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
  });
  console.log('[backend-library] MongoDB connected');
};
