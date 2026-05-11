import { Request, Response, NextFunction } from 'express';
import * as bibliotecaService from '../services/biblioteca.service';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await bibliotecaService.getAllBiblioteca();
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getByDocumento = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const numero_documento = req.params.numero_documento as string;
    const data = await bibliotecaService.getByNumeroDocumento(numero_documento);
    if (!data) {
      res.status(404).json({ success: false, error: { message: 'Estudiante no encontrado' } });
      return;
    }
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getMetricas = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await bibliotecaService.getMetricasGlobales();
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};
