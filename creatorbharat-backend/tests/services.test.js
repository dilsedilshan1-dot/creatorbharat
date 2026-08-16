// 🇮🇳 CreatorBharat — Services & Controllers Architecture Unit Tests
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GigService } from '../src/services/gigService.js';
import { CampaignService } from '../src/services/campaignService.js';
import { ApplicationService } from '../src/services/applicationService.js';
import { CreatorService } from '../src/services/creatorService.js';
import { BrandService } from '../src/services/brandService.js';
import { MessageService } from '../src/services/messageService.js';
import { UploadService } from '../src/services/uploadService.js';
import { NotificationService } from '../src/services/notificationService.js';
import { AIService } from '../src/services/aiService.js';
import prisma from '../src/prisma.js';

describe('Phase 2E — Service Layer Architectural Unit Tests', () => {

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ─── 1. GigService ────────────────────────────────────────────────────────
  describe('GigService', () => {
    it('rejects milestone submission if user is not CREATOR', async () => {
      await expect(
        GigService.submitMilestoneProof({ role: 'BRAND', id: 'u1' }, 'g1', 'm1', {})
      ).rejects.toThrow('Only creators can submit milestone proof of work.');
    });

    it('rejects milestone approval if user is not BRAND', async () => {
      await expect(
        GigService.approveMilestone({ role: 'CREATOR', id: 'u1' }, 'g1', 'm1')
      ).rejects.toThrow('Only brands can approve milestones.');
    });
  });

  // ─── 2. CampaignService ───────────────────────────────────────────────────
  describe('CampaignService', () => {
    it('rejects campaign creation if title or description is missing', async () => {
      await expect(
        CampaignService.createCampaign({ role: 'BRAND', id: 'u1' }, { title: '' })
      ).rejects.toThrow('Title and description are required.');
    });

    it('rejects campaign creation if user is not a BRAND', async () => {
      await expect(
        CampaignService.createCampaign({ role: 'CREATOR', id: 'u1' }, { title: 'T', description: 'D' })
      ).rejects.toThrow('Access restricted to brands only.');
    });
  });

  // ─── 3. ApplicationService ────────────────────────────────────────────────
  describe('ApplicationService', () => {
    it('rejects application if campaignId is missing', async () => {
      await expect(
        ApplicationService.apply({ role: 'CREATOR', id: 'u1' }, {})
      ).rejects.toThrow('Campaign ID is required.');
    });

    it('rejects status update if status is missing', async () => {
      await expect(
        ApplicationService.updateStatus({ role: 'BRAND', id: 'u1' }, 'app1', '')
      ).rejects.toThrow('Status is required.');
    });
  });

  // ─── 4. CreatorService ────────────────────────────────────────────────────
  describe('CreatorService', () => {
    it('sanitizes Aadhaar and PAN URLs for non-owner/non-admin viewers', () => {
      const rawCreator = {
        id: 'c1',
        userId: 'u_owner',
        name: 'Test Creator',
        aadhaarUrl: 'https://secret.com/aadhaar.pdf',
        panUrl: 'https://secret.com/pan.pdf'
      };

      const publicView = CreatorService.sanitizeCreatorKYC(rawCreator, { id: 'u_stranger', role: 'CREATOR' });
      expect(publicView.aadhaarUrl).toBeUndefined();
      expect(publicView.panUrl).toBeUndefined();
      expect(publicView.name).toBe('Test Creator');

      const ownerView = CreatorService.sanitizeCreatorKYC(rawCreator, { id: 'u_owner', role: 'CREATOR' });
      expect(ownerView.aadhaarUrl).toBe('https://secret.com/aadhaar.pdf');

      const adminView = CreatorService.sanitizeCreatorKYC(rawCreator, { id: 'u_admin', role: 'ADMIN' });
      expect(adminView.panUrl).toBe('https://secret.com/pan.pdf');
    });

    it('rejects non-Indian state updates', async () => {
      await expect(
        CreatorService.updateMyProfile({ role: 'CREATOR', id: 'u1' }, { state: 'California' })
      ).rejects.toThrow('Only Indian locations are allowed for creator profiles.');
    });
  });

  // ─── 5. BrandService ──────────────────────────────────────────────────────
  describe('BrandService', () => {
    it('throws 404 when brand is not found', async () => {
      vi.spyOn(prisma.brand, 'findUnique').mockResolvedValue(null);
      await expect(BrandService.getBrandById('missing_b1')).rejects.toThrow('Brand profile not found.');
    });
  });

  // ─── 6. MessageService ────────────────────────────────────────────────────
  describe('MessageService', () => {
    it('rejects conversation access for non-brand/non-creator roles', async () => {
      await expect(
        MessageService.getConversations({ role: 'ANONYMOUS', id: 'u1' })
      ).rejects.toThrow('Messaging is available for registered creators and brands only.');
    });
  });

  // ─── 7. UploadService ─────────────────────────────────────────────────────
  describe('UploadService', () => {
    it('rejects invalid or traversal filenames on delete', async () => {
      await expect(
        UploadService.deleteUpload({ role: 'ADMIN', id: 'u1' }, '../manifest.json')
      ).rejects.toThrow('Invalid or prohibited filename.');

      await expect(
        UploadService.deleteUpload({ role: 'ADMIN', id: 'u1' }, 'manifest.json')
      ).rejects.toThrow('Invalid or prohibited filename.');
    });
  });

  // ─── 8. NotificationService ───────────────────────────────────────────────
  describe('NotificationService', () => {
    it('createNotification gracefully handles database errors without crashing caller', async () => {
      vi.spyOn(prisma.notification, 'create').mockRejectedValue(new Error('DB Connection Timeout'));
      const result = await NotificationService.createNotification({ userId: 'u1', title: 'Test' });
      expect(result).toBeNull();
    });
  });

  // ─── 9. AIService ─────────────────────────────────────────────────────────
  describe('AIService', () => {
    it('generates fallback brief when Gemini is disabled', async () => {
      const brief = await AIService.generateBrief({
        brandName: 'Mamaearth',
        productName: 'Vitamin C Serum',
        niche: 'Skincare'
      });

      expect(brief).toHaveProperty('title');
      expect(brief).toHaveProperty('description');
      expect(brief).toHaveProperty('budget');
      expect(brief.niches).toBe('Skincare');
    });

    it('generates local pitch fallback with dialect selection', async () => {
      const pitch = await AIService.generatePitch({
        creatorName: 'Rohan Sharma',
        creatorNiches: 'Tech & Lifestyle',
        brandName: 'boAt Lifestyle',
        campaignTitle: 'New Earbuds Launch',
        dialect: 'Hinglish'
      });

      expect(pitch.pitch).toContain('Rohan Sharma');
      expect(pitch.pitch).toContain('boAt Lifestyle');
    });
  });
});
