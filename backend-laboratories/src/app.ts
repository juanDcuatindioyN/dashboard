import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import csvRoutes from './routes/csv.routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();
const PORT = process.env.PORT || 3002;

// Ensure data directories exist
['raw', 'clean', 'error'].forEach((dir) => {
  const p = path.join(__dirname, '..', 'data', dir);
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
});

app.use(cors());
app.use(express.json());

app.use('/api/v1/files', csvRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'backend-laboratories', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[backend-laboratories] running at http://localhost:${PORT}`);
});
