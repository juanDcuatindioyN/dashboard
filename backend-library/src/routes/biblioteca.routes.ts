import { Router } from 'express';
import * as bibliotecaController from '../controllers/biblioteca.controller';

const router = Router();

router.get('/',                          bibliotecaController.getAll);
router.get('/metricas',                  bibliotecaController.getMetricas);
router.get('/:numero_documento',         bibliotecaController.getByDocumento);

export default router;
