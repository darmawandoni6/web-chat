import { Request, Response, Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Storage engine configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.resolve(process.cwd(), 'uploads'));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${crypto.randomUUID()}${ext}`;
    cb(null, uniqueName);
  },
});

// File filter (images, pdf, doc, txt)
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max 5MB
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDF, and text files under 5MB are allowed.'));
    }
  },
});

// Upload route
router.post('/', authenticateToken, upload.single('file') as any, (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    fileUrl,
    filename: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype,
  });
});

export default router;
