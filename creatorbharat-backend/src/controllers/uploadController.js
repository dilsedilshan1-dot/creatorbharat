// 🇮🇳 CreatorBharat SaaS Upload Controller
import { UploadService } from '../services/uploadService.js';

export class UploadController {
  static async uploadImage(req, res) {
    try {
      const baseUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
      const result = await UploadService.uploadImage(req.user, req.file, { baseUrl });
      return res.json(result);
    } catch (err) {
      console.error('[uploads/image] Error:', err.message);
      const status = err.statusCode || 500;
      const message = err.statusCode ? err.message : 'File upload failed. Please try again.';
      return res.status(status).json({ error: message });
    }
  }

  static async uploadVideo(req, res) {
    try {
      const baseUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
      const result = await UploadService.uploadVideo(req.user, req.file, { baseUrl });
      return res.json(result);
    } catch (err) {
      console.error('[uploads/video] Error:', err.message);
      const status = err.statusCode || 500;
      const message = err.statusCode ? err.message : 'File upload failed. Please try again.';
      return res.status(status).json({ error: message });
    }
  }

  static async getUploads(req, res) {
    try {
      const baseUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
      const list = await UploadService.getUploads(req.user, { baseUrl });
      return res.json(list);
    } catch (err) {
      console.error('[GET /api/uploads] Error:', err.message);
      return res.status(500).json({ error: 'Failed to retrieve uploads list.' });
    }
  }

  static async deleteUpload(req, res) {
    try {
      const { filename } = req.params;
      const result = await UploadService.deleteUpload(req.user, filename);
      return res.json(result);
    } catch (err) {
      console.error('[DELETE /api/uploads/:filename] Error:', err.message);
      const status = err.statusCode || 500;
      const message = err.statusCode ? err.message : 'Failed to delete media file.';
      return res.status(status).json({ error: message });
    }
  }
}
