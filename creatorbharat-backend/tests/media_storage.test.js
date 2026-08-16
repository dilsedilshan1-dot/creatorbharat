// 📁 CreatorBharat SaaS Media Storage & Migration Test Suite
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '../src/prisma.js';
import { StorageService } from '../src/services/storageService.js';
import { UploadService } from '../src/services/uploadService.js';
import { reconcileMediaAssets } from '../scripts/migrate_media_assets.js';

describe('Phase 2G — Media Storage Service & Migration Test Suite', () => {

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ─── 1. Checksum Generation ───────────────────────────────────────────────
  it('1. StorageService.calculateChecksum computes deterministic SHA-256 hashes', () => {
    const bufferA = Buffer.from('CreatorBharat Media Content 🇮🇳');
    const bufferB = Buffer.from('CreatorBharat Media Content 🇮🇳');
    const bufferC = Buffer.from('Different Content');

    const hashA = StorageService.calculateChecksum(bufferA);
    const hashB = StorageService.calculateChecksum(bufferB);
    const hashC = StorageService.calculateChecksum(bufferC);

    expect(hashA).toBe(hashB);
    expect(hashA).not.toBe(hashC);
    expect(hashA).toMatch(/^[a-f0-9]{64}$/);
    expect(StorageService.calculateChecksum(null)).toBeNull();
  });

  // ─── 2. Resource Type Determination ───────────────────────────────────────
  it('2. StorageService.determineResourceType classifies images, videos, and documents', () => {
    expect(StorageService.determineResourceType('image/jpeg', 'photo.jpg')).toBe('IMAGE');
    expect(StorageService.determineResourceType('image/png', 'banner.png')).toBe('IMAGE');
    expect(StorageService.determineResourceType('video/mp4', 'reel.mp4')).toBe('VIDEO');
    expect(StorageService.determineResourceType('video/quicktime', 'video.mov')).toBe('VIDEO');
    expect(StorageService.determineResourceType('application/pdf', 'contract.pdf')).toBe('DOCUMENT');
    expect(StorageService.determineResourceType('unknown/mime', 'doc.pdf')).toBe('DOCUMENT');
  });

  // ─── 3. Visibility Authorization Enforcement ──────────────────────────────
  describe('StorageService.getMediaAssetById Visibility Controls', () => {
    it('allows anyone to view PUBLIC media assets', async () => {
      vi.spyOn(prisma.mediaAsset, 'findUnique').mockResolvedValue({
        id: 'asset_pub',
        visibility: 'PUBLIC',
        ownerId: 'u_owner',
        url: 'https://cdn.com/pub.png'
      });

      const asset = await StorageService.getMediaAssetById('asset_pub', { id: 'u_stranger', role: 'CREATOR' });
      expect(asset.id).toBe('asset_pub');
    });

    it('rejects non-admin users from accessing ADMIN_ONLY media assets', async () => {
      vi.spyOn(prisma.mediaAsset, 'findUnique').mockResolvedValue({
        id: 'asset_admin',
        visibility: 'ADMIN_ONLY',
        ownerId: 'u_admin',
        url: 'https://cdn.com/admin.png'
      });

      await expect(
        StorageService.getMediaAssetById('asset_admin', { id: 'u_creator', role: 'CREATOR' })
      ).rejects.toThrow('Access denied. Administrator privileges required.');

      const adminView = await StorageService.getMediaAssetById('asset_admin', { id: 'u_admin', role: 'ADMIN' });
      expect(adminView.id).toBe('asset_admin');
    });

    it('rejects strangers from accessing OWNER_ONLY / PRIVATE media assets', async () => {
      vi.spyOn(prisma.mediaAsset, 'findUnique').mockResolvedValue({
        id: 'asset_priv',
        visibility: 'PRIVATE',
        ownerId: 'u_owner',
        url: 'https://cdn.com/kyc.pdf'
      });

      await expect(
        StorageService.getMediaAssetById('asset_priv', { id: 'u_stranger', role: 'CREATOR' })
      ).rejects.toThrow('Access denied. Private asset.');

      const ownerView = await StorageService.getMediaAssetById('asset_priv', { id: 'u_owner', role: 'CREATOR' });
      expect(ownerView.id).toBe('asset_priv');
    });
  });

  // ─── 4. Dual-Read Upload Retrieval ────────────────────────────────────────
  it('4. UploadService.getUploads merges MediaAsset database records with legacy manifest items', async () => {
    vi.spyOn(prisma.mediaAsset, 'findMany').mockResolvedValue([
      {
        id: 'asset_1',
        storageKey: 'img-1.png',
        url: 'http://localhost:4000/uploads/img-1.png',
        sizeBytes: BigInt(2048),
        mimeType: 'image/png',
        ownerId: 'u1',
        checksum: 'hash1',
        createdAt: new Date()
      }
    ]);

    const uploads = await UploadService.getUploads({ id: 'u1', role: 'CREATOR' });
    expect(uploads).toBeInstanceOf(Array);
    expect(uploads.some(u => u.url === 'http://localhost:4000/uploads/img-1.png')).toBe(true);
  });

  // ─── 5. Two-Step Safe Deletion ────────────────────────────────────────────
  describe('UploadService.deleteUpload Deletion Safety', () => {
    it('rejects path traversal attacks and prohibited filenames', async () => {
      await expect(
        UploadService.deleteUpload({ id: 'u1', role: 'ADMIN' }, '../manifest.json')
      ).rejects.toThrow('Invalid or prohibited filename.');

      await expect(
        UploadService.deleteUpload({ id: 'u1', role: 'ADMIN' }, 'manifest.json')
      ).rejects.toThrow('Invalid or prohibited filename.');

      await expect(
        UploadService.deleteUpload({ id: 'u1', role: 'ADMIN' }, '..')
      ).rejects.toThrow('Invalid or prohibited filename.');
    });

    it('soft-deletes MediaAsset when user is owner', async () => {
      vi.spyOn(prisma.mediaAsset, 'findFirst').mockResolvedValue({
        id: 'asset_del',
        storageKey: 'del-pic.png',
        ownerId: 'u_owner',
        storageProvider: 'CLOUDINARY',
        deletedAt: null
      });

      const updateSpy = vi.spyOn(prisma.mediaAsset, 'update').mockResolvedValue({
        id: 'asset_del',
        deletedAt: new Date(),
        status: 'ARCHIVED'
      });

      const res = await UploadService.deleteUpload({ id: 'u_owner', role: 'CREATOR' }, 'del-pic.png');
      expect(res.success).toBe(true);
      expect(updateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'asset_del' },
          data: expect.objectContaining({ status: 'ARCHIVED' })
        })
      );
    });

    it('rejects deletion when caller is neither owner nor admin', async () => {
      vi.spyOn(prisma.mediaAsset, 'findFirst').mockResolvedValue({
        id: 'asset_del',
        storageKey: 'del-pic.png',
        ownerId: 'u_owner',
        storageProvider: 'LOCAL',
        deletedAt: null
      });

      await expect(
        UploadService.deleteUpload({ id: 'u_intruder', role: 'CREATOR' }, 'del-pic.png')
      ).rejects.toThrow('Forbidden. You do not own this media asset.');
    });
  });

  // ─── 6. Migration Reconciliation & Safety Gates ───────────────────────────
  describe('Media Asset Migration & Reconciliation', () => {
    it('defaults to DRY_RUN mode and creates zero database records', async () => {
      const createSpy = vi.spyOn(prisma.mediaAsset, 'create');
      vi.spyOn(prisma.mediaAsset, 'findMany').mockResolvedValue([]);

      const report = await reconcileMediaAssets();
      expect(report.mode).toBe('DRY_RUN');
      expect(createSpy).not.toHaveBeenCalled();
    });

    it('fails closed and refuses APPLY mode if approval or confirmation flags are missing', async () => {
      const createSpy = vi.spyOn(prisma.mediaAsset, 'create');
      vi.spyOn(prisma.mediaAsset, 'findMany').mockResolvedValue([]);

      // Only mode is set to APPLY, but approvals are missing
      process.env.MIGRATION_MODE = 'APPLY';
      process.env.MEDIA_MIGRATION_APPROVED = 'false';
      process.env.CONFIRM_MEDIA_MIGRATION = 'NO';

      const report = await reconcileMediaAssets({ mode: 'APPLY' });
      expect(report.mode).toBe('DRY_RUN');
      expect(createSpy).not.toHaveBeenCalled();

      // Clean env
      delete process.env.MIGRATION_MODE;
      delete process.env.MEDIA_MIGRATION_APPROVED;
      delete process.env.CONFIRM_MEDIA_MIGRATION;
    });

    it('idempotently skips assets already recorded in MediaAsset table', async () => {
      vi.spyOn(prisma.mediaAsset, 'findMany').mockResolvedValue([
        {
          id: 'asset_exist',
          storageKey: 'existing_banner.png',
          url: '/uploads/existing_banner.png',
          checksum: 'hash_exist',
          deletedAt: null
        }
      ]);

      const report = await reconcileMediaAssets();
      expect(report.readyForMigration).toBe(0);
    });
  });
});
