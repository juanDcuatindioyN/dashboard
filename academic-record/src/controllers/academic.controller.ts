import { Request, Response, NextFunction } from 'express';
import * as academicRepository from '../repositories/academic.repository';

export const getEstudiantes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await academicRepository.getAllEstudiantes();
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getAsignaturas = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await academicRepository.getAllAsignaturas();
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getCursos = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await academicRepository.getAllCursos();
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getMatriculas = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await academicRepository.getAllMatriculas();
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

export const getCalificaciones = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await academicRepository.getAllCalificaciones();
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};
