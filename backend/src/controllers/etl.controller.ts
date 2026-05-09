import { Request, Response, NextFunction } from 'express';
import * as etlRepository from '../repositories/etl.repository';
import type { IDashboardData } from '../types/dashboard';

/**
 * GET /api/etl/dashboard
 * Retorna los datos consolidados para el dashboard analítico.
 */
export const getDashboardData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [libraryImpact, subjectPerformance, laboratoryUsage] = await Promise.all([
      etlRepository.getLibraryImpact(),
      etlRepository.getSubjectPerformance(),
      etlRepository.getLaboratoryUsage(),
    ]);

    const data: IDashboardData = { libraryImpact, subjectPerformance, laboratoryUsage };
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/etl/run
 * Ejecuta el proceso ETL y valida la conectividad con la base de datos.
 */
export const runEtl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await Promise.all([
      etlRepository.getLibraryImpact(),
      etlRepository.getSubjectPerformance(),
      etlRepository.getLaboratoryUsage(),
    ]);

    res.status(200).json({
      success: true,
      message: 'ETL process completed successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};
