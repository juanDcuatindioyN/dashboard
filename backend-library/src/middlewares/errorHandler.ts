import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  const status = err instanceof Error && 'status' in err ? (err as any).status : 500;
  const message = err instanceof Error ? err.message : 'Internal Server Error';
  const stack = err instanceof Error ? err.stack : undefined;
  res.status(status).json({
    success: false,
    error: { message, ...(process.env.NODE_ENV === 'development' && { stack }) },
  });
};
