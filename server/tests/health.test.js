const request = require('supertest');
const app = require('../src/app');

describe('TrustNest API Health & Base Endpoints', () => {
  it('GET /health should return 200 with active status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'active');
    expect(res.body.message).toContain('TrustNest API');
  });

  it('GET non-existent route should return 404 with error payload', async () => {
    const res = await request(app).get('/api/v1/invalid-route-xyz');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body.message).toContain('Route not found');
  });
});
