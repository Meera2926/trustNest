const request = require('supertest');

// Mock User model with query chaining for select()
jest.mock('../src/models/User', () => {
  const mockUser = {
    _id: '64f123456789012345678901',
    name: 'Existing Customer',
    email: 'existing@trustnest.in',
    isActive: true,
    isSuspended: false,
    matchPassword: jest.fn().mockResolvedValue(false),
  };

  return {
    findOne: jest.fn().mockImplementation((query) => {
      let isExisting = false;
      if (query?.email === 'existing@trustnest.in') isExisting = true;
      if (Array.isArray(query?.$or)) {
        isExisting = query.$or.some((item) => item.email === 'existing@trustnest.in');
      }

      const returnedUser = isExisting ? mockUser : null;
      return {
        select: jest.fn().mockResolvedValue(returnedUser),
        then: function (resolve) { return resolve(returnedUser); },
      };
    }),
    create: jest.fn().mockResolvedValue({
      _id: '64f123456789012345678902',
      name: 'Test Customer',
      email: 'new@trustnest.in',
      role: 'customer',
    }),
  };
});

jest.mock('../src/models/CustomerProfile', () => ({
  create: jest.fn().mockResolvedValue({}),
}));

// Mock OTP service to avoid network delays
jest.mock('../src/services/otp.service', () => ({
  createAndSendOTP: jest.fn().mockResolvedValue(true),
  verifyOTP: jest.fn().mockResolvedValue(true),
}));

jest.mock('../src/services/email.service', () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
  templates: {
    welcomeEmail: jest.fn().mockReturnValue({ subject: 'Welcome', html: '<p>Welcome</p>' }),
  },
}));

const app = require('../src/app');

describe('Authentication API Suite', () => {
  it('POST /api/v1/auth/login should reject empty credentials with 400 or 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({});

    expect([400, 401]).toContain(res.status);
    expect(res.body).toHaveProperty('success', false);
  });

  it('POST /api/v1/auth/login should reject non-existent email with 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'nonexistent@trustnest.in',
        password: 'IncorrectPassword!123',
      });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('success', false);
  });

  it('POST /api/v1/auth/register/customer should create new customer and return 201', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register/customer')
      .send({
        name: 'New Test Customer',
        email: 'new@trustnest.in',
        phone: '+919999988888',
        password: 'Password@123',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('success', true);
  });
});
