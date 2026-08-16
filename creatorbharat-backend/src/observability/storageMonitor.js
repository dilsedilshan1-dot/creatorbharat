// 📁 CreatorBharat SaaS Storage & Media Asset Observability Monitor
import fs from 'fs';
import path from 'path';
import prisma from '../prisma.js';
import { storageConfig } from '../config/storage.config.js';

export class StorageMonitor {
  /**
   * Evaluates storage subsystem health without revealing secrets or paths.
   */
  static async getStorageDiagnostics() {
    let localWritable = false;
    const provider = storageConfig.cloudinary.cloudName ? 'CLOUDINARY' : 'LOCAL';

    if (provider === 'LOCAL') {
      try {
        const uploadDir = path.resolve(process.cwd(), storageConfig.localUploadsDir || 'public/uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        // Test directory writability
        const probeFile = path.join(uploadDir, `.probe_${Date.now()}`);
        fs.writeFileSync(probeFile, 'ok');
        fs.unlinkSync(probeFile);
        localWritable = true;
      } catch (e) {
        localWritable = false;
      }
    }

    let mediaCounts = {
      total: 0,
      images: 0,
      videos: 0,
      documents: 0
    };

    try {
      const typeCounts = await prisma.mediaAsset.groupBy({
        by: ['resourceType'],
        _count: { resourceType: true }
      });

      typeCounts.forEach(tc => {
        if (tc.resourceType === 'IMAGE') mediaCounts.images = tc._count.resourceType;
        if (tc.resourceType === 'VIDEO') mediaCounts.videos = tc._count.resourceType;
        if (tc.resourceType === 'DOCUMENT') mediaCounts.documents = tc._count.resourceType;
      });

      mediaCounts.total = await prisma.mediaAsset.count();
    } catch (e) {
      // Prisma query fallback if table not accessible
    }

    const isHealthy = provider === 'LOCAL' ? localWritable : !!storageConfig.cloudinary.cloudName;

    return {
      status: isHealthy ? 'HEALTHY' : 'DEGRADED',
      provider,
      storageAvailable: isHealthy,
      mediaAssets: mediaCounts,
      timestamp: new Date().toISOString()
    };
  }
}
