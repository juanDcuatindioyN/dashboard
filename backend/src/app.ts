import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import academicRoutes from './routes/academic.routes';
import etlRoutes from './routes/etl.routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Academic CRUD endpoints
app.use('/api/academic', academicRoutes);

// ETL / Dashboard analytics endpoints
app.use('/api/etl', etlRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'backend', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
