// 🇮🇳 CreatorBharat SaaS Upload Service
import fs from 'fs';
import path from 'path';
import { uploadFileToCloud } from '../utils/uploader.js';

export class UploadService {
  /**
   * Helper to log uploads in manifest.json.
   */
  static logUpload(fileName, fileUrl, size, type, userId) {
    try {
      const publicDir = path.join(process.cwd(), 'public');
      const uploadsDir = path.join(publicDir, 'uploads');
      const manifestPath = path.join(uploadsDir, 'manifest.json');

      if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

      let manifest = [];
      if (fs.existsSync(manifestPath)) {
        try {
          manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        } catch (e) {
          manifest = [];
        }
      }

      if (!manifest.some(item => item.url === fileUrl || item.name === fileName)) {
        manifest.unshift({
          name: fileName,
          url: fileUrl,
          size,
          type,
          userId: userId || null,
          createdAt: new Date()
        });
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
      }
    } catch (err) {
      console.error('[UploadService.logUpload] Manifest write error:', err.message);
    }
  }

  /**
   * Helper to delete from manifest.json.
   */
  static unlogUpload(fileName) {
    try {
      const manifestPath = path.join(process.cwd(), 'public', 'uploads', 'manifest.json');
      if (!fs.existsSync(manifestPath)) return;
      let manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      manifest = manifest.filter(item => item.name !== fileName && !item.url.endsWith('/' + fileName));
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
    } catch (err) {
      console.error('[UploadService.unlogUpload] Manifest delete error:', err.message);
    }
  }

  /**
   * Uploads an image file to cloud/local storage.
   */
  static async uploadImage(user, file, reqMeta = {}) {
    if (!file) {
      const error = new Error('No file provided. Please attach a file.');
      error.statusCode = 400;
      throw error;
    }

    const folder = user.role === 'ADMIN'
      ? `creatorbharat/admin/images`
      : user.role === 'CREATOR' 
      ? `creatorbharat/creators/${user.id}`
      : `creatorbharat/brands/${user.id}`;

    const fileUrl = await uploadFileToCloud(file.buffer, file.originalname, folder);

    const baseUrl = process.env.BACKEND_URL || reqMeta.baseUrl || 'http://localhost:4000';
    const absoluteUrl = fileUrl.startsWith('/') ? `${baseUrl}${fileUrl}` : fileUrl;

    this.logUpload(file.originalname, absoluteUrl, file.size, file.mimetype, user.id);

    return {
      success: true,
      url: absoluteUrl,
      fileName: file.originalname
    };
  }

  /**
   * Uploads a video file to cloud/local storage.
   */
  static async uploadVideo(user, file, reqMeta = {}) {
    if (!file) {
      const error = new Error('No file provided. Please attach a file.');
      error.statusCode = 400;
      throw error;
    }

    const folder = user.role === 'ADMIN'
      ? `creatorbharat/admin/gallery`
      : user.role === 'CREATOR'
      ? `creatorbharat/creators/${user.id}/videos`
      : `creatorbharat/brands/${user.id}/videos`;

    const fileUrl = await uploadFileToCloud(file.buffer, file.originalname, folder);

    const baseUrl = process.env.BACKEND_URL || reqMeta.baseUrl || 'http://localhost:4000';
    const absoluteUrl = fileUrl.startsWith('/') ? `${baseUrl}${fileUrl}` : fileUrl;

    this.logUpload(file.originalname, absoluteUrl, file.size, file.mimetype, user.id);

    return {
      success: true,
      url: absoluteUrl,
      fileName: file.originalname
    };
  }

  /**
   * Retrieves list of uploaded media items.
   */
  static async getUploads(user, reqMeta = {}) {
    const manifestPath = path.join(process.cwd(), 'public', 'uploads', 'manifest.json');
    let manifest = [];
    if (fs.existsSync(manifestPath)) {
      try {
        manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      } catch (e) {
        manifest = [];
      }
    }

    if (user.role !== 'ADMIN') {
      manifest = manifest.filter(item => !item.userId || item.userId === user.id);
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (fs.existsSync(uploadsDir) && user.role === 'ADMIN') {
      const files = fs.readdirSync(uploadsDir);
      const baseUrl = process.env.BACKEND_URL || reqMeta.baseUrl || 'http://localhost:4000';
      
      files.forEach(file => {
        if (file === 'manifest.json') return;
        const alreadyInManifest = manifest.some(item => item.name === file || item.url.endsWith('/' + file));
        if (!alreadyInManifest) {
          try {
            const filePath = path.join(uploadsDir, file);
            const stat = fs.statSync(filePath);
            const ext = path.extname(file).toLowerCase();
            const mime = ext === '.mp4' || ext === '.mov' || ext === '.avi' || ext === '.mkv' || ext === '.webm' ? 'video/mp4' : 'image/png';
            manifest.push({
              name: file,
              url: `${baseUrl}/uploads/${file}`,
              size: stat.size,
              type: mime,
              createdAt: stat.birthtime
            });
          } catch (e) {
            // Ignore files that fail stat
          }
        }
      });
    }

    manifest.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return manifest;
  }

  /**
   * Deletes uploaded media file safely with path traversal protection.
   */
  static async deleteUpload(user, rawFilename) {
    const filename = path.basename(rawFilename);
    if (!filename || filename !== rawFilename || filename === 'manifest.json' || filename === '.' || filename === '..') {
      const error = new Error('Invalid or prohibited filename.');
      error.statusCode = 400;
      throw error;
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const resolvedPath = path.resolve(uploadsDir, filename);

    if (!resolvedPath.startsWith(uploadsDir)) {
      const error = new Error('Path traversal attempt rejected.');
      error.statusCode = 400;
      throw error;
    }

    const manifestPath = path.join(uploadsDir, 'manifest.json');
    if (fs.existsSync(manifestPath)) {
      try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        const item = manifest.find(i => i.name === filename || i.url.endsWith('/' + filename));
        if (item && item.userId && item.userId !== user.id && user.role !== 'ADMIN') {
          const error = new Error('Forbidden. You do not own this media file.');
          error.statusCode = 403;
          throw error;
        }
      } catch (e) {
        if (e.statusCode) throw e;
      }
    }

    if (fs.existsSync(resolvedPath)) {
      fs.unlinkSync(resolvedPath);
    }

    this.unlogUpload(filename);

    return { success: true, message: 'Media file deleted successfully.' };
  }
}
