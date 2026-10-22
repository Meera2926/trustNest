const swaggerUi = require('swagger-ui-express');

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'TrustNest REST & Real-Time API',
    version: '1.0.0',
    description: 'Comprehensive API documentation for TrustNest — verified on-demand local & home services platform.',
    contact: {
      name: 'TrustNest Engineering Support',
      email: 'support@trustnest.in',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local Development Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/health': {
      get: {
        summary: 'Server Health Check',
        responses: { 200: { description: 'Server is active and running smoothly' } },
      },
    },
    '/api/v1/auth/register/customer': {
      post: {
        summary: 'Register new Customer account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Rahul Sharma' },
                  email: { type: 'string', example: 'rahul@example.com' },
                  phone: { type: 'string', example: '+919876543210' },
                  password: { type: 'string', example: 'Secret@123' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Registration successful' } },
      },
    },
    '/api/v1/auth/login': {
      post: {
        summary: 'Log in with credentials',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Authentication successful, returns tokens' } },
      },
    },
    '/api/v1/workers': {
      get: {
        summary: 'Search verified service workers with geospatial radius',
        parameters: [
          { name: 'service', in: 'query', schema: { type: 'string' } },
          { name: 'city', in: 'query', schema: { type: 'string' } },
          { name: 'lat', in: 'query', schema: { type: 'number' } },
          { name: 'lng', in: 'query', schema: { type: 'number' } },
          { name: 'radius', in: 'query', schema: { type: 'number', default: 15 } },
          { name: 'minRating', in: 'query', schema: { type: 'number' } },
        ],
        responses: { 200: { description: 'Filtered workers list' } },
      },
    },
    '/api/v1/bookings': {
      post: {
        summary: 'Create service booking',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  workerId: { type: 'string' },
                  service: { type: 'string' },
                  startDate: { type: 'string', format: 'date-time' },
                  duration: { type: 'number', example: 2 },
                  serviceAddress: { type: 'object' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Booking created' } },
      },
      get: {
        summary: 'Get current user bookings',
        responses: { 200: { description: 'User bookings list' } },
      },
    },
    '/api/v1/payments/create-order': {
      post: {
        summary: 'Create Razorpay order for booking',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  bookingId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'Order created with Razorpay key and orderId' } },
      },
    },
    '/api/v1/ai/recommendations': {
      post: {
        summary: 'Get AI recommended workers based on multi-factor scoring',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  service: { type: 'string' },
                  budget: { type: 'object' },
                  location: { type: 'object' },
                },
              },
            },
          },
        },
        responses: { 200: { description: 'AI ranked recommendations' } },
      },
    },
    '/api/v1/reviews': {
      post: {
        summary: 'Submit customer review for completed service',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  bookingId: { type: 'string' },
                  rating: { type: 'number', minimum: 1, maximum: 5 },
                  comment: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Review recorded and worker score updated' } },
      },
    },
  },
};

const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};

module.exports = setupSwagger;
