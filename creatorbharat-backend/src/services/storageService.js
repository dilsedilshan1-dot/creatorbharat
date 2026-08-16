// 📁 CreatorBharat SaaS Storage Service
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import prisma from '../prisma.js';
import { uploadFileToCloud } from '../utils/uploader.js';

export class StorageService {
  /**
   * Calculates cryptographic SHA-256 checksum for data integrity and deduplication.
   *
   * @param {Buffer} buffer
   * @returns {string} SHA-256 hex string
   */
  static calculateChecksum(buffer) {
    if (!buffer) return null;
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Derives resourceType enum from MIME type and filename.
   */
  static determineResourceType(mimeType = '', filename = '') {
    const ext = path.extname(filename).toLowerCase();
    const mime = (mimeType || '').toLowerCase();

    if (mime.startsWith('image/') || ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'].includes(ext)) {
      return 'IMAGE';
    }
    if (mime.startsWith('video/') || ['.mp4', '.mov', '.avi', '.mkv', '.webm'].includes(ext)) {
      return 'VIDEO';
    }
    if (mime === 'application/pdf' || ext === '.pdf') {
      return 'DOCUMENT';
    }
    return 'DOCUMENT';
  }

  /**
   * Persists a MediaAsset record to database.
   */
  static async createMediaAsset({
    ownerId = null,
    ownerType = 'USER',
    resourceType = 'IMAGE',
    storageProvider = 'LOCAL',
    storageKey,
    publicId = null,
    url,
    mimeType = null,
    sizeBytes = null,
    checksum = null,
    visibility = 'PUBLIC',
    status = 'ACTIVE',
    metadata = {}
  }, client = null) {
    const db = client || prisma;

    return db.mediaAsset.create({
      data: {
        ownerId: ownerId || null,
        ownerType: ownerType || (ownerId ? 'USER' : 'SYSTEM'),
        resourceType,
        storageProvider,
        storageKey,
        publicId: publicId || null,
        url,
        mimeType: mimeType || null,
        sizeBytes: sizeBytes !== null ? BigInt(sizeBytes) : null,
        checksum: checksum || null,
        visibility,
        status,
        metadata: metadata || {}
      }
    });
  }

  /**
   * Retrieves a single MediaAsset with visibility authorization checks.
   */
  static async getMediaAssetById(assetId, user = null) {
    const asset = await prisma.mediaAsset.findUnique({
      where: { id: assetId }
    });

    if (!asset || asset.deletedAt) {
      const error = new Error('Media asset not found.');
      error.statusCode = 404;
      throw error;
    }

    // Visibility authorization enforcement
    if (asset.visibility === 'ADMIN_ONLY' && user?.role !== 'ADMIN') {
      const error = new Error('Access denied. Administrator privileges required.');
      error.statusCode = 403;
      throw error;
    }

    if (asset.visibility === 'OWNER_ONLY' || asset.visibility === 'PRIVATE') {
      const isOwner = user && asset.ownerId === user.id;
      const isAdmin = user && user.role === 'ADMIN';
      if (!isOwner && !isAdmin) {
        const error = new Error('Access denied. Private asset.');
        error.statusCode = 403;
        throw error;
      }
    }

    return asset;
  }

  /**
   * Uploads file, computes checksum, and writes MediaAsset record.
   */
  static async uploadAndRecord(file, user, options = {}) {
    if (!file || !file.buffer) {
      const error = new Error('No valid file buffer provided.');
      error.statusCode = 400;
      throw error;
    }

    const checksum = this.calculateChecksum(file.buffer);
    const resourceType = options.resourceType || this.determineResourceType(file.mimetype, file.originalname);
    const visibility = options.visibility || (user?.role === 'ADMIN' ? 'PUBLIC' : 'PUBLIC');
    const folder = user?.role === 'ADMIN'
      ? `creatorbharat/admin/${resourceType.toLowerCase()}s`
      : user?.role === 'CREATOR'
      ? `creatorbharat/creators/${user.id}`
      : `creatorbharat/brands/${user?.id || 'guest'}`;

    const uploadedUrl = await uploadFileToCloud(file.buffer, file.originalname, folder);

    const baseUrl = process.env.BACKEND_URL || options.baseUrl || 'http://localhost:4000';
    const absoluteUrl = uploadedUrl.startsWith('/') ? `${baseUrl}${uploadedUrl}` : uploadedUrl;
    const isCloudinary = uploadedUrl.includes('cloudinary.com');
    const storageProvider = isCloudinary ? 'CLOUDINARY' : 'LOCAL';
    const storageKey = isCloudinary ? uploadedUrl : path.basename(uploadedUrl);

    const mediaAsset = await this.createMediaAsset({
      ownerId: user?.id || null,
      ownerType: user?.role === 'CREATOR' ? 'CREATOR' : user?.role === 'BRAND' ? 'BRAND' : 'USER',
      resourceType,
      storageProvider,
      storageKey,
      url: absoluteUrl,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      checksum,
      visibility,
      metadata: {
        originalFilename: file.originalname,
        uploadedAt: new Date().toISOString()
      }
    });

    return {
      mediaAsset,
      url: absoluteUrl,
      fileName: file.originalname
    };
  }

  /**
   * Deletes media asset safely with ownership authorization.
   */
  static async deleteMediaAsset(user, filenameOrId) {
    if (!filenameOrId || typeof filenameOrId !== 'string') {
      const error = new Error('Invalid media identifier.');
      error.statusCode = 400;
      throw error;
    }

    // 1. Try finding in MediaAsset table first
    const asset = await prisma.mediaAsset.findFirst({
      where: {
        OR: [
          { id: filenameOrId },
          { storageKey: filenameOrId },
          { storageKey: path.basename(filenameOrId) },
          { url: { endsWith: filenameOrId } }
        ],
        deletedAt: null
      }
    });

    if (asset) {
      if (asset.ownerId && asset.ownerId !== user.id && user.role !== 'ADMIN') {
        const error = new Error('Forbidden. You do not own this media asset.');
        error.statusCode = 403;
        throw error;
      }

      // If local storage, delete file safely
      if (asset.storageProvider === 'LOCAL') {
        const filename = path.basename(asset.storageKey);
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        const resolvedPath = path.resolve(uploadsDir, filename);

        if (resolvedPath.startsWith(uploadsDir) && fs.existsSync(resolvedPath)) {
          fs.unlinkSync(resolvedPath);
        }
      }

      // Soft delete in database
      await prisma.mediaAsset.update({
        where: { id: asset.id },
        data: {
          deletedAt: new Date(),
          status: 'ARCHIVED'
        }
      });

      return { success: true, message: 'Media asset deleted successfully.' };
    }

    return null; // Signals caller to check legacy manifest
  }
}
