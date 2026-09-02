import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/index.js';

describe('Health & Base API Checks', () => {
  it('GET / should return welcome message', async () => {
    const res = await request(app)
      .get('/')
      .expect(200);

    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toContain('CreatorBharat');
    expect(res.body.status).toBe('online');
  });

  it('GET /api/health should return system status details', async () => {
    const res = await request(app)
      .get('/api/health')
      .expect(200);

    expect(res.body.status).toBe('healthy');
    expect(res.body).toHaveProperty('timestamp');
  });

  it('GET /api should return api message', async () => {
    const res = await request(app)
      .get('/api')
      .expect(200);

    expect(res.body.message).toContain('REST API Engine');
  });

  it('GET /non-existent-route should return 404', async () => {
    const res = await request(app)
      .get('/non-existent-route')
      .expect(404);

    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toContain('not found');
  });

  it('GET /api/pages/faq and /api/pages/faqs should resolve consistent dynamic page configs', async () => {
    const resFaq = await request(app)
      .get('/api/pages/faq')
      .expect(200);

    const resFaqs = await request(app)
      .get('/api/pages/faqs')
      .expect(200);

    expect(resFaq.body).toHaveProperty('content');
    expect(resFaqs.body).toHaveProperty('content');
    expect(Array.isArray(resFaq.body.content)).toBe(true);
    expect(Array.isArray(resFaqs.body.content)).toBe(true);
    expect(resFaq.body.content.length).toBeGreaterThan(0);
    expect(resFaq.body.content[0]).toHaveProperty('q');
    expect(resFaq.body.content[0]).toHaveProperty('a');
    expect(resFaqs.body.content[0]).toEqual(resFaq.body.content[0]);
  });

  it('GET /api/pages/about should continue to return about page configuration', async () => {
    const res = await request(app)
      .get('/api/pages/about')
      .expect(200);

    expect(res.body).toHaveProperty('content');
    expect(res.body.content).toHaveProperty('BLUEPRINT_CARDS');
  });
});
