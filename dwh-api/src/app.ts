import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import etlRoutes from './routes/etl.routes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

app.use('/api/etl', etlRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'dwh-api', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`DWH API running at http://localhost:${PORT}`);
});
