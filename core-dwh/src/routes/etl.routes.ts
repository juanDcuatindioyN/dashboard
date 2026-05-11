import { Router } from 'express';
import * as etlController from '../controllers/etl.controller';

const router = Router();

router.get('/dashboard', etlController.getDashboardData);
router.get('/cruce',     etlController.getCruceLabNotas);
router.post('/run',      etlController.runEtl);

export default router;
