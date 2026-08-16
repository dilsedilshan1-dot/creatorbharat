// 🇮🇳 CreatorBharat SaaS Storage Configuration
export const storageConfig = Object.freeze({
  cloudinary: Object.freeze({
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || ''
  }),
  maxImageSize: 5 * 1024 * 1024,  // 5MB
  maxVideoSize: 50 * 1024 * 1024, // 50MB
  localUploadsDir: 'public/uploads'
});
