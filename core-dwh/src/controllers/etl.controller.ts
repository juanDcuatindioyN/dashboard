import { Request, Response, NextFunction } from 'express';
import * as etlService from '../services/etl.service';
import type { IDashboardData } from '../types/dashboard';

/**
 * GET /api/etl/dashboard
 * Retorna los datos consolidados para el dashboard.
 */
export const getDashboardData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [libraryImpact, subjectPerformance, laboratoryUsage] = await Promise.all([
      etlService.getLibraryImpact(),
      etlService.getSubjectPerformance(),
      etlService.getLaboratoryUsage(),
    ]);

    const data: IDashboardData = { libraryImpact, subjectPerformance, laboratoryUsage };
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

/**
 * POST /api/etl/run
 * Orquesta la extracción de los 3 microservicios y valida conectividad.
 */
export const runEtl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [academic, library, laboratories] = await Promise.allSettled([
      etlService.extractAcademic(),
      etlService.extractLibrary(),
      etlService.extractLaboratories(),
    ]);

    const report = {
      academic:      academic.status,
      library:       library.status,
      laboratories:  laboratories.status,
    };

    res.status(200).json({
      success: true,
      message: 'ETL process completed',
      report,
      timestamp: new Date().toISOString(),
    });
  } catch (error) { next(error); }
};
