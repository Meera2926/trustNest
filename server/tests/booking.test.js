const request = require('supertest');
const app = require('../src/app');

describe('Booking Lifecycle API Suite', () => {
  it('POST /api/v1/bookings should block unauthenticated requests with 401', async () => {
    const res = await request(app)
      .post('/api/v1/bookings')
      .send({
        workerId: '64f123456789012345678901',
        service: 'cleaner',
        startDate: '2026-11-01',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/bookings should block unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/v1/bookings');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
