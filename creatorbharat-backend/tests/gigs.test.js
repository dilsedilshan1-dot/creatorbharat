import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';
import prisma from '../src/prisma.js';

// Mock authorization token signing/verification
vi.mock('jsonwebtoken', () => ({
  default: {
    verify: () => ({ userId: 'mock-user-id' })
  }
}));

vi.mock('../src/prisma.js', () => {
  const mockPrisma = {
    user: {
      findUnique: vi.fn().mockResolvedValue({ id: 'mock-user-id', role: 'CREATOR' })
    },
    creator: {
      findUnique: vi.fn().mockResolvedValue({ id: 'mock-creator-id', userId: 'mock-user-id' })
    },
    brand: {
      findUnique: vi.fn().mockResolvedValue({ id: 'mock-brand-id', userId: 'mock-user-id' })
    },
    campaignGig: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn(),
      update: vi.fn()
    },
    gigMilestone: {
      update: vi.fn(),
      findMany: vi.fn().mockResolvedValue([])
    },
    walletTransaction: {
      create: vi.fn().mockResolvedValue({})
    },
    outboxEvent: {
      create: vi.fn().mockResolvedValue({ id: 'evt-1' })
    },
    $transaction: vi.fn().mockImplementation(async (callback) => {
      if (typeof callback === 'function') {
        return callback(mockPrisma);
      }
      return Promise.all(callback);
    })
  };
  return {
    default: mockPrisma
  };
});

describe('Gigs & Escrow Milestone API Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /api/gigs/me should return list of gigs for creator', async () => {
    prisma.user.findUnique.mockResolvedValueOnce({ id: 'mock-user-id', role: 'CREATOR' });
    prisma.creator.findUnique.mockResolvedValueOnce({ id: 'mock-creator-id', userId: 'mock-user-id' });
    prisma.campaignGig.findMany.mockResolvedValueOnce([
      { id: 'gig-1', creatorId: 'mock-creator-id', status: 'ACTIVE', milestones: [] }
    ]);

    const res = await request(app)
      .get('/api/gigs/me')
      .set('Authorization', 'Bearer mock-token')
      .expect(200);

    expect(res.body).toBeInstanceOf(Array);
    expect(res.body[0].id).toBe('gig-1');
  });

  it('POST /api/gigs/:id/milestones/:mId/submit should submit proof successfully', async () => {
    prisma.user.findUnique.mockResolvedValueOnce({ id: 'mock-user-id', role: 'CREATOR' });
    prisma.creator.findUnique.mockResolvedValueOnce({ id: 'mock-creator-id', userId: 'mock-user-id' });
    prisma.campaignGig.findUnique.mockResolvedValueOnce({
      id: 'gig-1',
      creatorId: 'mock-creator-id',
      status: 'ACTIVE',
      milestones: [{ id: 'milestone-1', status: 'PENDING' }]
    });
    prisma.gigMilestone.update.mockResolvedValueOnce({
      id: 'milestone-1',
      status: 'SUBMITTED',
      proofText: 'Live link',
      proofUrl: 'https://instagram.com/p/123'
    });

    const res = await request(app)
      .post('/api/gigs/gig-1/milestones/milestone-1/submit')
      .set('Authorization', 'Bearer mock-token')
      .send({ proofText: 'Live link', proofUrl: 'https://instagram.com/p/123' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.milestone.status).toBe('SUBMITTED');
  });
});
