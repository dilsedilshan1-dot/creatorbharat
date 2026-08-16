// 🇮🇳 CreatorBharat SaaS File Upload Router
import express from 'express';
import fs from 'fs';
import path from 'path';
import { upload, uploadVideo, uploadFileToCloud } from '../utils/uploader.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Helper to log uploads in manifest.json
function logUpload(fileName, fileUrl, size, type, userId) {
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const uploadsDir = path.join(publicDir, 'uploads');
    const manifestPath = path.join(uploadsDir, 'manifest.json');

    // Create directories if missing
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

    // Prevent duplicate logs
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
    console.error('[logUpload] Manifest write error:', err.message);
  }
}

// Helper to delete from manifest.json
function unlogUpload(fileName) {
  try {
    const manifestPath = path.join(process.cwd(), 'public', 'uploads', 'manifest.json');
    if (!fs.existsSync(manifestPath)) return;
    let manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    manifest = manifest.filter(item => item.name !== fileName && !item.url.endsWith('/' + fileName));
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  } catch (err) {
    console.error('[unlogUpload] Manifest delete error:', err.message);
  }
}

// POST /api/uploads/image - Secure image/document upload
router.post('/image', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided. Please attach a file.' });
    }

    // Determine folder structure based on user role
    const folder = req.user.role === 'ADMIN'
      ? `creatorbharat/admin/images`
      : req.user.role === 'CREATOR' 
      ? `creatorbharat/creators/${req.user.id}`
      : `creatorbharat/brands/${req.user.id}`;

    // Upload to Cloud (or local fallback)
    const fileUrl = await uploadFileToCloud(req.file.buffer, req.file.originalname, folder);

    // Resolve fully qualified URL for local fallbacks
    const baseUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
    const absoluteUrl = fileUrl.startsWith('/') ? `${baseUrl}${fileUrl}` : fileUrl;

    // Log the upload details
    logUpload(req.file.originalname, absoluteUrl, req.file.size, req.file.mimetype, req.user.id);

    res.json({
      success: true,
      url: absoluteUrl,
      fileName: req.file.originalname
    });
  } catch (err) {
    console.error('[uploads/image] Error:', err.message);
    res.status(500).json({ error: 'File upload failed. Please try again.' });
  }
});

// POST /api/uploads/video - Secure video/large file uploader
router.post('/video', authMiddleware, uploadVideo.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided. Please attach a file.' });
    }

    const folder = req.user.role === 'ADMIN'
      ? `creatorbharat/admin/gallery`
      : req.user.role === 'CREATOR'
      ? `creatorbharat/creators/${req.user.id}/videos`
      : `creatorbharat/brands/${req.user.id}/videos`;

    // Upload to Cloud (or local fallback)
    const fileUrl = await uploadFileToCloud(req.file.buffer, req.file.originalname, folder);

    // Resolve fully qualified URL for local fallbacks
    const baseUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
    const absoluteUrl = fileUrl.startsWith('/') ? `${baseUrl}${fileUrl}` : fileUrl;

    // Log the upload details
    logUpload(req.file.originalname, absoluteUrl, req.file.size, req.file.mimetype, req.user.id);

    res.json({
      success: true,
      url: absoluteUrl,
      fileName: req.file.originalname
    });
  } catch (err) {
    console.error('[uploads/video] Error:', err.message);
    res.status(500).json({ error: 'File upload failed. Please try again.' });
  }
});

// GET /api/uploads - Get list of uploaded media items
router.get('/', authMiddleware, async (req, res) => {
  try {
    const manifestPath = path.join(process.cwd(), 'public', 'uploads', 'manifest.json');
    let manifest = [];
    if (fs.existsSync(manifestPath)) {
      try {
        manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      } catch (e) {
        manifest = [];
      }
    }

    // Filter by user if not ADMIN
    if (req.user.role !== 'ADMIN') {
      manifest = manifest.filter(item => !item.userId || item.userId === req.user.id);
    }

    // Also scan the local directory to make sure files exist on disk
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (fs.existsSync(uploadsDir) && req.user.role === 'ADMIN') {
      const files = fs.readdirSync(uploadsDir);
      const baseUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
      
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

    // Sort: newest first
    manifest.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(manifest);
  } catch (err) {
    console.error('[GET /api/uploads] Error:', err.message);
    res.status(500).json({ error: 'Failed to retrieve uploads list.' });
  }
});

// DELETE /api/uploads/:filename - Delete uploaded media file
router.delete('/:filename', authMiddleware, async (req, res) => {
  try {
    const rawFilename = req.params.filename;
    
    // Path traversal protection: ensure filename is safe
    const filename = path.basename(rawFilename);
    if (!filename || filename !== rawFilename || filename === 'manifest.json' || filename === '.' || filename === '..') {
      return res.status(400).json({ error: 'Invalid or prohibited filename.' });
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const resolvedPath = path.resolve(uploadsDir, filename);

    // Verify resolved path remains inside uploads directory
    if (!resolvedPath.startsWith(uploadsDir)) {
      return res.status(400).json({ error: 'Path traversal attempt rejected.' });
    }

    // Verify file ownership via manifest if available
    const manifestPath = path.join(uploadsDir, 'manifest.json');
    if (fs.existsSync(manifestPath)) {
      try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        const item = manifest.find(i => i.name === filename || i.url.endsWith('/' + filename));
        if (item && item.userId && item.userId !== req.user.id && req.user.role !== 'ADMIN') {
          return res.status(403).json({ error: 'Forbidden. You do not own this media file.' });
        }
      } catch (e) {
        // Continue if manifest parse fails
      }
    }

    // Try deleting file locally
    if (fs.existsSync(resolvedPath)) {
      fs.unlinkSync(resolvedPath);
    }

    // Unlog from manifest
    unlogUpload(filename);

    res.json({ success: true, message: 'Media file deleted successfully.' });
  } catch (err) {
    console.error('[DELETE /api/uploads/:filename] Error:', err.message);
    res.status(500).json({ error: 'Failed to delete media file.' });
  }
});

export default router;
