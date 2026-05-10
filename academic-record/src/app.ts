import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import academicRoutes from './routes/academic.routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', academicRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'academic-record', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[academic-record] running at http://localhost:${PORT}`);
});
