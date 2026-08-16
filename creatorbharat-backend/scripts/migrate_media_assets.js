// 📁 CreatorBharat SaaS Media Asset Migration & Reconciliation Script
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import prisma from '../src/prisma.js';
import { StorageService } from '../src/services/storageService.js';

export async function reconcileMediaAssets(options = {}) {
  const isApply = options.mode === 'APPLY' || process.env.MIGRATION_MODE === 'APPLY';
  const isApproved = process.env.MEDIA_MIGRATION_APPROVED === 'true';
  const isConfirmed = process.env.CONFIRM_MEDIA_MIGRATION === 'YES';

  const mode = (isApply && isApproved && isConfirmed) ? 'APPLY' : 'DRY_RUN';

  const report = {
    mode,
    manifestRecords: 0,
    filesDiscovered: 0,
    alreadyMigrated: 0,
    readyForMigration: 0,
    missingOnDisk: 0,
    orphanOnDisk: 0,
    duplicates: 0,
    checksumMatches: 0,
    checksumFailures: 0,
    ownershipMatches: 0,
    ownershipUnresolved: 0,
    migratedCount: 0,
    errors: []
  };

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  const manifestPath = path.join(uploadsDir, 'manifest.json');

  // 1. Read manifest entries
  let manifest = [];
  if (fs.existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } catch (err) {
      report.errors.push(`Manifest JSON parse error: ${err.message}`);
    }
  }
  report.manifestRecords = manifest.length;

  // 2. Discover disk files
  const diskFiles = new Map();
  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir);
    for (const file of files) {
      if (file === 'manifest.json') continue;
      const fullPath = path.join(uploadsDir, file);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isFile()) {
          const buffer = fs.readFileSync(fullPath);
          const checksum = crypto.createHash('sha256').update(buffer).digest('hex');
          diskFiles.set(file, {
            filename: file,
            path: fullPath,
            size: stat.size,
            checksum,
            stat
          });
        }
      } catch (e) {
        report.errors.push(`Failed to inspect file ${file}: ${e.message}`);
      }
    }
  }
  report.filesDiscovered = diskFiles.size;

  // 3. Fetch existing database MediaAssets
  let existingAssets = [];
  try {
    existingAssets = await prisma.mediaAsset.findMany({
      where: { deletedAt: null }
    });
  } catch (dbErr) {
    report.errors.push(`Database MediaAsset table check: ${dbErr.message}`);
    existingAssets = [];
  }

  const existingByStorageKey = new Map();
  const existingByChecksum = new Map();

  for (const asset of existingAssets) {
    existingByStorageKey.set(asset.storageKey, asset);
    if (asset.checksum) {
      existingByChecksum.set(asset.checksum, asset);
    }
  }

  const processedFilenames = new Set();
  const candidatesToMigrate = [];

  // 4. Reconcile manifest entries
  for (const entry of manifest) {
    const filename = entry.name || path.basename(entry.url || '');
    processedFilenames.add(filename);

    const onDisk = diskFiles.get(filename);
    const existingDb = existingByStorageKey.get(filename) || (entry.url && existingByStorageKey.get(entry.url));

    if (existingDb) {
      report.alreadyMigrated++;
      if (onDisk && existingDb.checksum && onDisk.checksum === existingDb.checksum) {
        report.checksumMatches++;
      }
      continue;
    }

    if (!onDisk) {
      report.missingOnDisk++;
      continue;
    }

    // Ownership check
    let ownerType = 'USER';
    if (entry.userId) {
      report.ownershipMatches++;
    } else {
      report.ownershipUnresolved++;
      ownerType = 'SYSTEM';
    }

    const resourceType = StorageService.determineResourceType(entry.type, filename);

    candidatesToMigrate.push({
      filename,
      url: entry.url,
      sizeBytes: onDisk.size,
      mimeType: entry.type || (resourceType === 'VIDEO' ? 'video/mp4' : 'image/png'),
      checksum: onDisk.checksum,
      ownerId: entry.userId || null,
      ownerType,
      resourceType,
      storageProvider: 'LOCAL',
      storageKey: filename,
      visibility: 'PUBLIC',
      createdAt: entry.createdAt ? new Date(entry.createdAt) : new Date()
    });
  }

  // 5. Discover orphan disk files (on disk but not in manifest)
  for (const [file, diskInfo] of diskFiles.entries()) {
    if (!processedFilenames.has(file)) {
      report.orphanOnDisk++;
      const existingDb = existingByStorageKey.get(file);
      if (!existingDb) {
        const resourceType = StorageService.determineResourceType('', file);
        candidatesToMigrate.push({
          filename: file,
          url: `/uploads/${file}`,
          sizeBytes: diskInfo.size,
          mimeType: resourceType === 'VIDEO' ? 'video/mp4' : 'image/png',
          checksum: diskInfo.checksum,
          ownerId: null,
          ownerType: 'SYSTEM',
          resourceType,
          storageProvider: 'LOCAL',
          storageKey: file,
          visibility: 'PUBLIC',
          createdAt: diskInfo.stat.birthtime
        });
      }
    }
  }

  report.readyForMigration = candidatesToMigrate.length;

  // 6. Execute migration if mode === 'APPLY'
  if (mode === 'APPLY' && candidatesToMigrate.length > 0) {
    for (const candidate of candidatesToMigrate) {
      try {
        await prisma.mediaAsset.create({
          data: {
            ownerId: candidate.ownerId,
            ownerType: candidate.ownerType,
            resourceType: candidate.resourceType,
            storageProvider: candidate.storageProvider,
            storageKey: candidate.storageKey,
            url: candidate.url,
            mimeType: candidate.mimeType,
            sizeBytes: BigInt(candidate.sizeBytes),
            checksum: candidate.checksum,
            visibility: candidate.visibility,
            status: 'ACTIVE',
            metadata: {
              originalFilename: candidate.filename,
              migratedFromManifest: true,
              migratedAt: new Date().toISOString()
            },
            createdAt: candidate.createdAt
          }
        });
        report.migratedCount++;
      } catch (err) {
        report.errors.push(`Failed to migrate ${candidate.filename}: ${err.message}`);
      }
    }
  }

  return report;
}

// Direct execution from CLI
if (process.argv[1] && process.argv[1].endsWith('migrate_media_assets.js')) {
  (async () => {
    try {
      console.log('==================================================');
      console.log('🇮🇳 CREATORBHARAT MEDIA ASSET MIGRATION & RECONCILIATION');
      console.log('==================================================');
      const result = await reconcileMediaAssets();
      console.log(`Execution Mode:         ${result.mode}`);
      console.log(`Manifest records:        ${result.manifestRecords}`);
      console.log(`Files discovered on disk: ${result.filesDiscovered}`);
      console.log(`Already migrated in DB:  ${result.alreadyMigrated}`);
      console.log(`Ready for migration:     ${result.readyForMigration}`);
      console.log(`Missing files:           ${result.missingOnDisk}`);
      console.log(`Orphan files on disk:    ${result.orphanOnDisk}`);
      console.log(`Ownership matches:       ${result.ownershipMatches}`);
      console.log(`Ownership unresolved:    ${result.ownershipUnresolved}`);
      if (result.mode === 'APPLY') {
        console.log(`Successfully migrated:   ${result.migratedCount}`);
      }
      if (result.errors.length > 0) {
        console.log('Errors encountered:', result.errors);
      }
      console.log('==================================================');
    } catch (err) {
      console.error('Fatal migration error:', err.message);
    } finally {
      await prisma.$disconnect();
    }
  })();
}
