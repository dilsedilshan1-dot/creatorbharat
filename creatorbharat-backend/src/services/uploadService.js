// 🇮🇳 CreatorBharat SaaS Upload Service (Dual-Read & Dual-Write Storage Engine)
import fs from 'fs';
import path from 'path';
import prisma from '../prisma.js';
import { StorageService } from './storageService.js';

export class UploadService {
  /**
   * Helper to log uploads in legacy manifest.json.
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
   * Helper to delete from legacy manifest.json.
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
   * Uploads an image file with dual-write to MediaAsset and legacy manifest.
   */
  static async uploadImage(user, file, reqMeta = {}) {
    if (!file) {
      const error = new Error('No file provided. Please attach a file.');
      error.statusCode = 400;
      throw error;
    }

    const { url, fileName } = await StorageService.uploadAndRecord(file, user, {
      resourceType: 'IMAGE',
      baseUrl: reqMeta.baseUrl
    });

    // Dual-write to manifest.json as fallback
    this.logUpload(fileName, url, file.size, file.mimetype, user?.id);

    return {
      success: true,
      url,
      fileName
    };
  }

  /**
   * Uploads a video file with dual-write to MediaAsset and legacy manifest.
   */
  static async uploadVideo(user, file, reqMeta = {}) {
    if (!file) {
      const error = new Error('No file provided. Please attach a file.');
      error.statusCode = 400;
      throw error;
    }

    const { url, fileName } = await StorageService.uploadAndRecord(file, user, {
      resourceType: 'VIDEO',
      baseUrl: reqMeta.baseUrl
    });

    // Dual-write to manifest.json as fallback
    this.logUpload(fileName, url, file.size, file.mimetype, user?.id);

    return {
      success: true,
      url,
      fileName
    };
  }

  /**
   * Retrieves list of uploaded media items with Dual-Read compatibility.
   */
  static async getUploads(user, reqMeta = {}) {
    const list = [];
    const seenUrls = new Set();

    // 1. Primary Read: Query MediaAsset database records
    try {
      const whereClause = { deletedAt: null };
      if (user.role !== 'ADMIN') {
        whereClause.ownerId = user.id;
      }

      const dbAssets = await prisma.mediaAsset.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' }
      });

      for (const asset of dbAssets) {
        list.push({
          id: asset.id,
          name: asset.metadata?.originalFilename || path.basename(asset.storageKey),
          url: asset.url,
          size: asset.sizeBytes ? Number(asset.sizeBytes) : 0,
          type: asset.mimeType || (asset.resourceType === 'VIDEO' ? 'video/mp4' : 'image/png'),
          userId: asset.ownerId,
          checksum: asset.checksum,
          createdAt: asset.createdAt
        });
        seenUrls.add(asset.url);
      }
    } catch (err) {
      console.warn('[UploadService.getUploads] MediaAsset read warning, falling back to manifest:', err.message);
    }

    // 2. Fallback Read: Merge unmigrated items from manifest.json
    const manifestPath = path.join(process.cwd(), 'public', 'uploads', 'manifest.json');
    if (fs.existsSync(manifestPath)) {
      try {
        let manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        if (user.role !== 'ADMIN') {
          manifest = manifest.filter(item => !item.userId || item.userId === user.id);
        }

        for (const item of manifest) {
          if (!seenUrls.has(item.url)) {
            list.push(item);
            seenUrls.add(item.url);
          }
        }
      } catch (e) {
        // Ignore JSON parse issues on fallback
      }
    }

    // 3. Fallback Read: If ADMIN, discover any untracked disk files
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (fs.existsSync(uploadsDir) && user.role === 'ADMIN') {
      const files = fs.readdirSync(uploadsDir);
      const baseUrl = process.env.BACKEND_URL || reqMeta.baseUrl || 'http://localhost:4000';

      files.forEach(file => {
        if (file === 'manifest.json') return;
        const fileUrl = `${baseUrl}/uploads/${file}`;
        if (!seenUrls.has(fileUrl)) {
          try {
            const filePath = path.join(uploadsDir, file);
            const stat = fs.statSync(filePath);
            const ext = path.extname(file).toLowerCase();
            const mime = ext === '.mp4' || ext === '.mov' || ext === '.avi' || ext === '.mkv' || ext === '.webm' ? 'video/mp4' : 'image/png';
            list.push({
              name: file,
              url: fileUrl,
              size: stat.size,
              type: mime,
              createdAt: stat.birthtime
            });
            seenUrls.add(fileUrl);
          } catch (e) {
            // Ignore files that fail stat
          }
        }
      });
    }

    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return list;
  }

  /**
   * Deletes uploaded media file safely with two-step MediaAsset & legacy fallback verification.
   */
  static async deleteUpload(user, rawFilename) {
    const filename = path.basename(rawFilename);
    if (!filename || filename !== rawFilename || filename === 'manifest.json' || filename === '.' || filename === '..') {
      const error = new Error('Invalid or prohibited filename.');
      error.statusCode = 400;
      throw error;
    }

    // 1. Try deleting via StorageService (checks MediaAsset DB record)
    const mediaAssetResult = await StorageService.deleteMediaAsset(user, rawFilename);
    if (mediaAssetResult) {
      this.unlogUpload(filename);
      return mediaAssetResult;
    }

    // 2. Fallback: Legacy manifest deletion with path traversal & ownership protection
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
