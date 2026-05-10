import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import * as csvController from '../controllers/csv.controller';

const RAW_DIR = path.join(__dirname, '..', '..', 'data', 'raw');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, RAW_DIR),
  filename: (_req, file, cb) => {
    const ts = Date.now();
    cb(null, `${ts}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

const router = Router();

router.get('/raw',          csvController.listRaw);
router.get('/clean',        csvController.getClean);
router.post('/upload',      upload.single('file'), csvController.uploadFile);
router.post('/process',     csvController.processFiles);

export default router;
