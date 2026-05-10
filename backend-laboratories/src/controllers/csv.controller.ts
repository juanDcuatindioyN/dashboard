import { Request, Response, NextFunction } from 'express';
import * as csvService from '../services/csv.service';

/** GET /api/v1/files/raw — lista archivos en /raw */
export const listRaw = (req: Request, res: Response, next: NextFunction) => {
  try {
    const files = csvService.listRawFiles();
    res.status(200).json({ success: true, data: files });
  } catch (error) { next(error); }
};

/** POST /api/v1/files/process — procesa /raw → /clean */
export const processFiles = (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = csvService.processRawFiles();
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
};

/** GET /api/v1/files/clean — retorna registros limpios como JSON */
export const getClean = (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = csvService.getCleanRecords();
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

/** POST /api/v1/files/upload — recibe CSV y lo guarda en /raw */
export const uploadFile = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: { message: 'No file uploaded' } });
      return;
    }
    res.status(201).json({
      success: true,
      data: { filename: req.file.filename, message: 'File saved to /raw' },
    });
  } catch (error) { next(error); }
};
