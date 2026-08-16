// 🇮🇳 CreatorBharat SaaS File Upload Router
import express from 'express';
import { upload, uploadVideo } from '../utils/uploader.js';
import { authMiddleware } from '../middleware/auth.js';
import { UploadController } from '../controllers/uploadController.js';

const router = express.Router();

// POST /api/uploads/image - Secure image/document upload
router.post('/image', authMiddleware, upload.single('file'), UploadController.uploadImage);

// POST /api/uploads/video - Secure video/large file uploader
router.post('/video', authMiddleware, uploadVideo.single('file'), UploadController.uploadVideo);

// GET /api/uploads - Get list of uploaded media items
router.get('/', authMiddleware, UploadController.getUploads);

// DELETE /api/uploads/:filename - Delete uploaded media file
router.delete('/:filename', authMiddleware, UploadController.deleteUpload);

export default router;
