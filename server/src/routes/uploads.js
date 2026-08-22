import { Router } from 'express';
import multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import { authRequired } from '../middleware/auth.js';

const directory = process.env.UPLOADS_PATH || './data/uploads/selfies';
fs.mkdirSync(directory, { recursive: true });
const storage = multer.diskStorage({
  destination: directory,
  filename: (req, file, callback) => callback(null, `${Date.now()}-${req.user.id}${path.extname(file.originalname).toLowerCase() || '.jpg'}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, callback) => callback(null, /^image\/(jpeg|jpg|png)$/.test(file.mimetype)) });
const router = Router();
router.post('/selfie', authRequired, upload.single('selfie'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'A JPEG or PNG selfie is required' });
  res.status(201).json({ url: `/uploads/selfies/${req.file.filename}` });
});
export default router;
