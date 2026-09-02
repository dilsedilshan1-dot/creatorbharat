// 🇮🇳 CreatorBharat SaaS CMS Publishing Roundtrip Integration Test Suite
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';
import prisma from '../src/prisma.js';
import jwt from 'jsonwebtoken';

vi.mock('../src/prisma.js', () => {
  const inMemoryStore = {
    dynamicPageConfigs: new Map(),
    events: new Map(),
    galleryItems: new Map(),
    users: new Map()
  };

  const mockPrisma = {
    user: {
      findUnique: vi.fn(({ where }) => {
        return Promise.resolve(inMemoryStore.users.get(where.id || where.email) || null);
      }),
      findFirst: vi.fn()
    },
    dynamicPageConfig: {
      findUnique: vi.fn(({ where }) => {
        const item = inMemoryStore.dynamicPageConfigs.get(where.pageName);
        return Promise.resolve(item || null);
      }),
      upsert: vi.fn(({ where, update, create }) => {
        const existing = inMemoryStore.dynamicPageConfigs.get(where.pageName);
        const result = existing
          ? { ...existing, content: update.content, updatedAt: new Date() }
          : { id: `cfg-${Date.now()}`, pageName: create.pageName, content: create.content, updatedAt: new Date() };
        inMemoryStore.dynamicPageConfigs.set(where.pageName, result);
        return Promise.resolve(result);
      }),
      delete: vi.fn(({ where }) => {
        inMemoryStore.dynamicPageConfigs.delete(where.pageName);
        return Promise.resolve({ success: true });
      })
    },
    event: {
      findMany: vi.fn(({ where }) => {
        const all = Array.from(inMemoryStore.events.values());
        if (where && where.published !== undefined) {
          return Promise.resolve(all.filter(e => e.published === where.published));
        }
        return Promise.resolve(all);
      }),
      findUnique: vi.fn(({ where }) => {
        return Promise.resolve(inMemoryStore.events.get(where.id) || null);
      }),
      create: vi.fn(({ data }) => {
        const item = { id: `evt-${Date.now()}-${Math.random()}`, ...data, createdAt: new Date(), updatedAt: new Date() };
        inMemoryStore.events.set(item.id, item);
        return Promise.resolve(item);
      }),
      update: vi.fn(({ where, data }) => {
        const existing = inMemoryStore.events.get(where.id);
        if (!existing) return Promise.resolve(null);
        const updated = { ...existing, ...data, updatedAt: new Date() };
        inMemoryStore.events.set(where.id, updated);
        return Promise.resolve(updated);
      }),
      delete: vi.fn(({ where }) => {
        inMemoryStore.events.delete(where.id);
        return Promise.resolve({ success: true });
      })
    },
    galleryItem: {
      findMany: vi.fn(() => {
        return Promise.resolve(Array.from(inMemoryStore.galleryItems.values()));
      }),
      findUnique: vi.fn(({ where }) => {
        return Promise.resolve(inMemoryStore.galleryItems.get(where.id) || null);
      }),
      create: vi.fn(({ data }) => {
        const item = { id: `gal-${Date.now()}-${Math.random()}`, ...data, createdAt: new Date(), updatedAt: new Date() };
        inMemoryStore.galleryItems.set(item.id, item);
        return Promise.resolve(item);
      }),
      update: vi.fn(({ where, data }) => {
        const existing = inMemoryStore.galleryItems.get(where.id);
        if (!existing) return Promise.resolve(null);
        const updated = { ...existing, ...data, updatedAt: new Date() };
        inMemoryStore.galleryItems.set(where.id, updated);
        return Promise.resolve(updated);
      }),
      delete: vi.fn(({ where }) => {
        inMemoryStore.galleryItems.delete(where.id);
        return Promise.resolve({ success: true });
      })
    },
    // Expose in-memory store for test control and cleanup
    _store: inMemoryStore
  };

  return {
    default: mockPrisma
  };
});

describe('Phase 3.2-C — CMS Publishing Roundtrip Integration Test Suite', () => {
  const TEST_JWT_SECRET = 'test_secret_for_vitest_runner_only_64_bytes_secure_value_1234567890';

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = TEST_JWT_SECRET;
    process.env.JWT_REFRESH_SECRET = TEST_JWT_SECRET + '_refresh';

    // Clear test store between test runs
    prisma._store.dynamicPageConfigs.clear();
    prisma._store.events.clear();
    prisma._store.galleryItems.clear();
    prisma._store.users.clear();

    // Seed default admin and creator users in memory
    prisma._store.users.set('admin-test-id', {
      id: 'admin-test-id',
      email: 'admin@creatorbharat.com',
      role: 'ADMIN',
      status: 'ACTIVE'
    });
    prisma._store.users.set('creator-test-id', {
      id: 'creator-test-id',
      email: 'creator@creatorbharat.com',
      role: 'CREATOR',
      status: 'ACTIVE'
    });
  });

  const generateToken = (userId, role = 'ADMIN', expiresIn = '1h') => {
    return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn });
  };

  // ─── 1. FAQ / DynamicPageConfig Roundtrip ────────────────────────────────────
  describe('1. FAQ CMS Publishing Roundtrip & Identifier Normalization', () => {
    it('1.1 Unauthenticated write to /api/admin/system/pages/faq is rejected (401)', async () => {
      const res = await request(app)
        .put('/api/admin/system/pages/faq')
        .send({ content: [{ q: 'Test Question', a: 'Test Answer' }] })
        .expect(401);

      expect(res.body.error).toContain('Access denied');
    });

    it('1.2 Creator role write to /api/admin/system/pages/faq is rejected (403)', async () => {
      const creatorToken = generateToken('creator-test-id', 'CREATOR');
      const res = await request(app)
        .put('/api/admin/system/pages/faq')
        .set('Authorization', `Bearer ${creatorToken}`)
        .send({ content: [{ q: 'Hacked Question', a: 'Hacked Answer' }] })
        .expect(403);

      expect(res.body.error).toContain('Forbidden');
    });

    it('1.3 Admin publishes FAQ config -> public endpoints (/faq and /faqs) return published content', async () => {
      const adminToken = generateToken('admin-test-id', 'ADMIN');
      const customFaqs = [
        { q: 'How fast are payouts processed?', a: 'Instant bank transfers within 60 seconds.', cat: 'Payments' },
        { q: 'Do I get an official verified badge?', a: 'Yes, after submitting identity and KYC verification.', cat: 'General' }
      ];

      // Step A: Admin saves/updates FAQ configuration
      const adminRes = await request(app)
        .put('/api/admin/system/pages/faq')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ content: customFaqs })
        .expect(200);

      expect(adminRes.body).toHaveProperty('pageName', 'faq');
      expect(adminRes.body.content).toEqual(customFaqs);

      // Step B: Public client reads /api/pages/faq
      const publicFaqRes = await request(app)
        .get('/api/pages/faq')
        .expect(200);

      expect(publicFaqRes.body).toHaveProperty('pageName', 'faq');
      expect(publicFaqRes.body.content).toEqual(customFaqs);

      // Step C: Public client reads alias /api/pages/faqs (normalized)
      const publicFaqsRes = await request(app)
        .get('/api/pages/faqs')
        .expect(200);

      expect(publicFaqsRes.body.content).toEqual(customFaqs);
    });
  });

  // ─── 2. Events Roundtrip & Published Filtering ───────────────────────────────
  describe('2. Events Publishing Roundtrip & Visibility Filtering', () => {
    it('2.1 Unauthenticated event creation is rejected (401)', async () => {
      const res = await request(app)
        .post('/api/events')
        .send({
          title: 'Unauthorized Summit',
          description: 'Fake Event',
          date: '2027-03-15T00:00:00.000Z',
          location: 'Delhi',
          type: 'SUMMIT'
        })
        .expect(401);

      expect(res.body.error).toContain('Access denied');
    });

    it('2.2 Admin creates published and draft events -> public GET /api/events returns only published', async () => {
      const adminToken = generateToken('admin-test-id', 'ADMIN');

      // Step A: Create a published event
      const pubEventRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'CreatorBharat National Summit 2027',
          description: 'India top creator gathering',
          date: '2027-03-15T00:00:00.000Z',
          location: 'Jaipur, Rajasthan',
          venue: 'Birla Auditorium',
          type: 'SUMMIT',
          coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
          registrationUrl: 'https://creatorbharat.com/events/summit',
          eligibility: 'CB Score 60+',
          isFeatured: true,
          published: true
        })
        .expect(201);

      expect(pubEventRes.body).toHaveProperty('id');
      expect(pubEventRes.body.published).toBe(true);

      // Step B: Create a draft/unpublished event
      const draftEventRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Internal Secret Workshop (Draft)',
          description: 'Unpublished draft event',
          date: '2027-04-10T00:00:00.000Z',
          location: 'Bangalore',
          venue: 'CB Tech Hub',
          type: 'WORKSHOP',
          published: false
        })
        .expect(201);

      expect(draftEventRes.body.published).toBe(false);

      // Step C: Public request to /api/events (should return ONLY the published event)
      const publicEventsRes = await request(app)
        .get('/api/events')
        .expect(200);

      expect(Array.isArray(publicEventsRes.body)).toBe(true);
      expect(publicEventsRes.body.length).toBe(1);
      expect(publicEventsRes.body[0].title).toBe('CreatorBharat National Summit 2027');
      expect(publicEventsRes.body.some(e => e.title.includes('Draft'))).toBe(false);
    });
  });

  // ─── 3. Gallery Roundtrip ───────────────────────────────────────────────────
  describe('3. Gallery Publishing Roundtrip', () => {
    it('3.1 Unauthenticated gallery creation is rejected (401)', async () => {
      const res = await request(app)
        .post('/api/admin/gallery')
        .send({
          title: 'Unauthorized Photo',
          category: 'Summits',
          type: 'photo',
          thumbnail: 'https://example.com/photo.jpg'
        })
        .expect(401);

      expect(res.body.error).toContain('Access denied');
    });

    it('3.2 Admin creates gallery item -> public GET /api/gallery returns published item', async () => {
      const adminToken = generateToken('admin-test-id', 'ADMIN');

      // Step A: Admin creates new gallery item
      const createRes = await request(app)
        .post('/api/admin/gallery')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Jaipur Summit 2026 Keynote',
          description: 'Main auditorium keynote presentation',
          category: 'Summits',
          type: 'photo',
          date: '15 Mar 2026',
          location: 'Jaipur, Rajasthan',
          thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
          tags: ['summit', 'keynote', 'jaipur']
        })
        .expect(201);

      expect(createRes.body).toHaveProperty('id');
      expect(createRes.body.title).toBe('Jaipur Summit 2026 Keynote');

      // Step B: Public user reads /api/gallery
      const publicGalleryRes = await request(app)
        .get('/api/gallery')
        .expect(200);

      expect(Array.isArray(publicGalleryRes.body)).toBe(true);
      expect(publicGalleryRes.body.length).toBeGreaterThan(0);
      const found = publicGalleryRes.body.find(g => g.title === 'Jaipur Summit 2026 Keynote');
      expect(found).toBeDefined();
      expect(found.category).toBe('Summits');
      expect(found.tags).toContain('keynote');
    });
  });
});
