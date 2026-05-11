import { Request, Response, NextFunction } from 'express';
import * as academicService from '../services/academic.service';

export const getEstudiantes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await academicService.getEstudiantes();
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getAsignaturas = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await academicService.getAsignaturas();
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getCursos = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await academicService.getCursos();
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getMatriculas = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await academicService.getMatriculas();
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getCalificaciones = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await academicService.getCalificaciones();
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};
