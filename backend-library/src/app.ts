import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { connectMongo } from './config/mongo';
import bibliotecaRoutes from './routes/biblioteca.routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/library', bibliotecaRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'backend-library', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[backend-library] running at http://localhost:${PORT}`);
});

// Connect to MongoDB after server starts — retries every 5s if unavailable
const connectWithRetry = async () => {
  try {
    await connectMongo();
  } catch (err: any) {
    console.error(`[backend-library] MongoDB connection failed: ${err.message}. Retrying in 5s...`);
    setTimeout(connectWithRetry, 5000);
  }
};

connectWithRetry();
