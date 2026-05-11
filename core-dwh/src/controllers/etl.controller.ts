import { Request, Response, NextFunction } from 'express';
import * as dwhRepository from '../repositories/dwh.repository';
import { runFullEtl } from '../services/loader.service';
import type { IDashboardData } from '../types/dashboard';

/**
 * GET /api/etl/dashboard
 */
export const getDashboardData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [libraryImpact, subjectPerformance, laboratoryUsage, kpis] = await Promise.all([
      dwhRepository.getLibraryImpact(),
      dwhRepository.getSubjectPerformance(),
      dwhRepository.getLaboratoryUsage(),
      dwhRepository.getKpis(),
    ]);

    const data: IDashboardData & { kpis: typeof kpis } = {
      libraryImpact, subjectPerformance, laboratoryUsage, kpis,
    };
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

/**
 * GET /api/etl/cruce
 * Retorna horas en laboratorio vs promedio de notas por estudiante.
 */
export const getCruceLabNotas = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await dwhRepository.getCruceLabNotas();
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

/**
 * POST /api/etl/run
 * Ejecuta el ETL completo: extrae, transforma y carga en el DWH.
 */
export const runEtl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await runFullEtl();
    res.status(result.success ? 200 : 500).json({
      success: result.success,
      message: result.success ? 'ETL completed successfully' : 'ETL failed',
      report: result.report,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
};
