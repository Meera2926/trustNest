const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const errorHandler = require('./middleware/error.middleware');
const ApiError = require('./utils/ApiError');

// Route imports
const authRoutes = require('./routes/auth.routes');
const workerRoutes = require('./routes/worker.routes');
const customerRoutes = require('./routes/customer.routes');
const bookingRoutes = require('./routes/booking.routes');
const paymentRoutes = require('./routes/payment.routes');
const aiRoutes = require('./routes/ai.routes');
const reviewRoutes = require('./routes/review.routes');
const setupSwagger = require('./config/swagger');

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(mongoSanitize());
app.use(xss());

// Request Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/workers', workerRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/reviews', reviewRoutes);

// Swagger API Documentation
setupSwagger(app);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'active', message: 'TrustNest API is running smoothly' });
});

// 404 Handler
app.use((req, res, next) => {
  next(ApiError.notFound(`Route not found - ${req.originalUrl}`));
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
