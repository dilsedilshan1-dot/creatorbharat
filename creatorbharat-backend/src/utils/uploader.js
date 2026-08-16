// 🇮🇳 CreatorBharat SaaS Uploader Utility (Multer + Cloudinary)
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import config from '../config/index.js';

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.storage.cloudinary.cloudName,
  api_key: config.storage.cloudinary.apiKey,
  api_secret: config.storage.cloudinary.apiSecret
});

// Configure Multer memory storage (holds file buffers in RAM)
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limit files to 5MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WEBP, and PDF files are allowed!'));
    }
  }
});

export const uploadVideo = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // Limit files to 50MB max for video
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp4|mov|avi|mkv|webm|jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only video (MP4, MOV, AVI, MKV, WEBM) and image files are allowed!'));
    }
  }
});

/**
 * Uploads a file buffer directly to Cloudinary.
 * Falls back to local disk storage if Cloudinary fails or credentials are missing.
 * 
 * @param {Buffer} fileBuffer - The file data
 * @param {string} originalName - The original name of the file
 * @param {string} folder - Target Cloudinary folder (e.g. 'creators/avatars')
 * @returns {Promise<string>} - The secure URL of the uploaded asset
 */
export async function uploadFileToCloud(fileBuffer, originalName, folder = 'creatorbharat') {
  const hasCloudinaryCredentials = 
    config.storage.cloudinary.cloudName && 
    config.storage.cloudinary.apiKey && 
    config.storage.cloudinary.apiSecret;

  if (!hasCloudinaryCredentials) {
    console.warn('[Uploader] Cloudinary credentials missing. Falling back to local storage.');
    return uploadFileToLocal(fileBuffer, originalName);
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) {
          console.error('[Uploader] Cloudinary upload error:', error.message || error);
          console.warn('[Uploader] Retrying file save using local storage fallback...');
          // Fall back to local upload on error
          uploadFileToLocal(fileBuffer, originalName)
            .then(resolve)
            .catch(reject);
        } else {
          resolve(result.secure_url);
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
}

/**
 * Saves a file buffer to local public/uploads directory.
 * 
 * @param {Buffer} fileBuffer - The file data
 * @param {string} originalName - The original name of the file
 * @returns {Promise<string>} - The local relative URL of the file
 */
export async function uploadFileToLocal(fileBuffer, originalName) {
  return new Promise((resolve, reject) => {
    try {
      const publicDir = path.join(process.cwd(), 'public');
      const uploadsDir = path.join(publicDir, 'uploads');

      // Create directories if they do not exist
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir);
      }
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir);
      }

      // Generate a unique file name to avoid collisions
      const fileExt = path.extname(originalName).toLowerCase();
      const uniqueName = crypto.randomBytes(12).toString('hex') + fileExt;
      const destinationPath = path.join(uploadsDir, uniqueName);

      fs.writeFile(destinationPath, fileBuffer, (err) => {
        if (err) {
          console.error('[Uploader] Local write error:', err);
          return reject(new Error('Failed to save file locally.'));
        }
        
        // Return relative path from public root
        resolve(`/uploads/${uniqueName}`);
      });
    } catch (err) {
      console.error('[Uploader] Local storage failure:', err);
      reject(err);
    }
  });
}
