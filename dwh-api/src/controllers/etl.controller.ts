import { Request, Response, NextFunction } from 'express';
import * as etlRepository from '../repositories/etl.repository';
import type { IDashboardData } from '../types/dashboard';

/**
 * GET /api/etl/dashboard
 * Retorna todos los datos consolidados para el dashboard.
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
 * Punto de entrada para ejecutar el proceso ETL.
 * Por ahora refresca los datos en memoria; aquí se puede agregar
 * lógica de transformación y carga a tablas DWH en el futuro.
 */
export const runEtl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Ejecutar todas las queries analíticas para validar que la DB responde
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
