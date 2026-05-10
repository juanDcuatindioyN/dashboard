import { Router } from 'express';
import * as academicController from '../controllers/academic.controller';

const router = Router();

router.get('/estudiantes',    academicController.getEstudiantes);
router.get('/asignaturas',    academicController.getAsignaturas);
router.get('/cursos',         academicController.getCursos);
router.get('/matriculas',     academicController.getMatriculas);
router.get('/calificaciones', academicController.getCalificaciones);

export default router;
