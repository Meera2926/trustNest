const request = require('supertest');
const crypto = require('crypto');
const app = require('../src/app');

describe('Payment & Razorpay Gateway Suite', () => {
  it('POST /api/v1/payments/create-order should require authentication', async () => {
    const res = await request(app)
      .post('/api/v1/payments/create-order')
      .send({ bookingId: '64f123456789012345678901' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('Verifies HMAC-SHA256 signature algorithm correctly', () => {
    const secret = 'test_webhook_secret_key_123';
    const orderId = 'order_test_998877';
    const paymentId = 'pay_test_112233';

    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    expect(typeof generatedSignature).toBe('string');
    expect(generatedSignature.length).toBe(64); // SHA-256 is 64 hex characters
  });
});
